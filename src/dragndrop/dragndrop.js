(function () {

/*

	lifecycle
	=========

	When dragging start
		create optionally a placeholder (generally used when the element is going to be
			able to move in the same container - if applicable)

	When dragging over something
		check the mimetype in the element being dragged over
		call on-drag-hover on it, which *may* result in *recreating a new placeholder*,
		in which case we delete the previous one.

	When dropping
		if we're not over an allowed dropzone, just cancel everything.
		call on-drag-accept on the originating element, if applicable
		call on-drop on the receiving element

	opt-drop-accept-mime : "application/x-myapp-type"

	opt-drag-handle : '??'

	locals
	======

	on-drag-start : (event, mime, data, metadata, placeholder)
	on-drag-hover : (event, mime, data, metadata, placeholder)
	on-drag-accept : (event, mime, data, metadata, placeholder, destination)
	on-drop: (event, placeholder, mime, metadata, ...)
 */

var mod = angular.module('optng.dragndrop', ['ng']);


mod.factory(
/**********************/
'$optng.dragndrop',
/**********************/
['$cacheFactory', '$animate',
function ($cacheFactory, $animate) {

	var _cache = $cacheFactory('optng.dragndrop');

	// Get a random UUIDv4 string. We don't check for collisions.
	function getNewId() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}

	function OptDragData(element, data, mime) {
		var id = null;

		// collision detection. should almost never happen.
		while ((id = getNewId())) {
			if (!_cache.get(id))
				break;
		}

		this.id = id;

		this.element = element;
		this.data = data;
		this.mime = mime;

		this.placeholder = null;

		_cache.put(id, this);
	}

	OptDragData.prototype = {
		setPlaceHolder: function setPlaceHolder(newone) {
			if (this.placeholder) {
				// remove the previous placeholder from the DOM.
				$animate.leave(this.placeholder);
			}
			this.placeholder = newone;
		},

		getPlaceHolder: function getPlaceHolder() {
			return this.placeholder;
		},

		clearFromCache: function clearFromCache() {
			_cache.remove(this.id);
		}
	};

	return {
		/**
		 *	@method  validateMime
		 *
		 *	@description
		 *		Check if the element is indeed interested by the dragged
		 *		element according to its mime definition.
		 */
		getDatasForEvent: function getDatasForEvent(dt, mime) {
			var mimes = mime.split(' ');
			var files = dt.files;
			var result = [];

			angular.forEach(dt.types, function (mime) {
				if (mimes.indexOf(mime) > -1) {
					result.push(_cache.get(dt.getData(mime)));
				}
			});

			return result;
		},
		cache: _cache,
		OptDragData: OptDragData,
		getNewId: getNewId,
		$drag: null // singleton, as we suppose there is only one drag
			// and drop at a time.
	};

}]);


mod.directive(
///////////////
'optDroppable',
///////////////
['$animate', '$optng.dragndrop', '$parse',
/**
 *	@directive optDroppable
 */
function ($animate, $dnd, $parse) {

	return {
		restrict: 'A',
		link: function optDroppableLink($scope, elt, attrs) {

			var on_drop_accepted = $parse(attrs.onDropAccepted || "");

			// EVENT : 'drop'
			elt.on('drop', function (event) {
				var dt = (event.originalEvent || event).dataTransfer;
				var mime = attrs.dropMime;

				console.log('dropped');

				var datas = $dnd.getDatasForEvent(dt, mime);

				if (!datas)
					return true;

				event.stopPropagation();
				event.preventDefault();

				console.log('ACCEPTED BITCH');

			});

		}
	}

}]);


mod.directive(
///////////////////
'optDraggableOver',
///////////////////
/**
 *	@directive opt-draggable-over
 */
['$animate', '$optng.dragndrop', '$parse',
function ($animate, $dnd, $parse) {

	return {
		restrict: 'A',
		link: function ($scope, elt, attrs) {

			var on_drag_accepted = $parse(attrs.onDragAccepted || "");
			var on_drag_rejected = $parse(attrs.onDragRejected || "");
			var drag_mime = attrs.dragOverMime || attrs.dragMime || "";

			// leaving out dragover for now, since we don't want to always
			// repeat the same stuff over and over.
			elt.on('dragenter dragover dragleave', function (event) {
				event = (event.originalEvent || event); // in case jQuery is included.
				var dt = event.dataTransfer;

				if (event.type === 'dragleave') {
					$animate.removeClass(elt, 'opt-drag-enabled');
					return true;
				}

				var datas = $dnd.getDatasForEvent(dt, drag_mime);
				// datas contains only [undefined, ...], since the html5 api does
				// not allow getData() on dataTransfer to return anything.

				if (!datas || !datas.length) {
					// Remove the 'enabled class'
					on_drag_rejected($scope, {
						$element: elt,
						$event: event
					});

					$animate.removeClass(elt, 'opt-drag-enabled');

					return true; // let the event bubble
				}

				$animate.addClass(elt, 'opt-drag-enabled');

				// run the drag_accepted function for each of our contents.
				on_drag_accepted($scope, {
					$drag: $dnd.$drag,
					$element: elt,
					$event: event
				});

				// stop the browser from doing something by default.
				event.preventDefault();
				// we're not letting the event bubble since this element can theorically
				// handle this drag.
				event.stopPropagation();
			});

		}
	};

}]);


mod.directive(
'optDragHandle',
function () {

	return {
		restrict: 'A',
		require: '^optDraggable',
		link: function (scope, elt, attrs, draggable) {

			draggable.setHandle(elt);

			elt.addClass('opt-drag-handle');

			elt.on('mousedown', function () {
				draggable.setHandleClicked(true);
			});

		}
	}

});


mod.directive(
///////////////
'optDraggable',
///////////////
/**
 *	@directive opt-draggable
 *
 * 	@classes
 * 		drag-enabled: set when the element has drag enabled
 * 		drag-disabled: set when we can't drag the element no more
 */
['$animate', '$optng.dragndrop', '$parse', '$compile',
function ($animate, $dnd, $parse, $compile) {

	return {
		restrict: 'A',
		controller: ['$scope', '$element', '$attrs',
		function ($scope, elt, attrs) {

			var handle = null;
			var handleclicked = false;

			this.setHandle = function setHandle(elt) {
				handle = elt;
			};

			this.setHandleClicked = function setHandleClicked(val) {
				handleclicked = val;
			};

			var on_drag_started = $parse(attrs.onDragStarted || "");
			var on_drag_ended = $parse(attrs.onDragEnded || "");

			// the value that will be dragged.
			var value = $scope.$eval(attrs.value);

			// an expression to watch for if we want to be able
			// to disable dragging on the fly.
			var drag_condition = attrs.dragEnable;

			elt.attr('draggable', true);

			$scope.$watch(drag_condition || "true", function (val) {
				// enable or disable dragging and change CSS classes accordingly.
				if (val) {

					var $drag = null;
					var original_style = null;

					//////////////////////////////////////////
					$animate.removeClass(elt, 'drag-disabled', function done() {
						elt.attr('draggable', true);
						$animate.addClass(elt, 'drag-enabled');
					});

					//////////////////////////////////////////
					elt.on('dragend', function (event) {
						// reset the placeholder.
						$drag.setPlaceHolder(null);
						$drag.clearFromCache();

						// reset the handle status, to be sure it won't be activated again
						handleclicked = false;

						if (original_style)
							elt.attr('style', original_style);
						else
							elt.removeAttr('style');

						original_style = null;
						$dnd.$drag = null;
					});

					//////////////////////////////////////////
					elt.on('dragstart', function (event) {
						if (handle && !handleclicked) {
							event.preventDefault();
							// event.stopPropagation();
							// cancel dragging if the handle was not clicked.
							return false;
						}

						var dt = (event.originalEvent || event).dataTransfer;

						dt.dropEffect = 'none'; // never let a drag change the DOM

						// the mimetype of the dragged element.
						var drag_mime = attrs.dragMime || "";
						var drag_value = $scope.$eval(attrs.dragValue);

						$drag = new $dnd.OptDragData(
							elt,
							drag_value,
							drag_mime
						);

						// putting the drag in the cache.
						dt.setData(drag_mime, $drag.id);
						$dnd.$drag = $drag;

						// create a new placeholder for this element, and hide the element
						var placeholder = angular.element('<' + elt[0].nodeName + '>')
							.addClass('opt-drag-placeholder')
							.html('&nbsp;');
						$compile(placeholder)($scope);

						// tell the DragData that we now have a placeholder.
						$drag.setPlaceHolder(placeholder);

						// the placeholder is inserted right *after* the element
						$drag.element.after(placeholder);
						$animate.enter(placeholder, null, $drag.element, function doneInserting () {
							original_style = elt.attr('style');
							elt.attr('style', 'display: none; !important;')
						});

						on_drag_started($scope, {
							$drag: $drag
						});
					});

				} else {

					elt.off('dragstart');
					elt.off('dragend');

					$animate.removeClass(elt, 'drag-enabled', function done() {
						elt.attr('draggable', false);
						$animate.addClass(elt, 'drag-disabled');
					});
				}
			});

		}]
	};

}])

})(); //! module optng.dragndrop
