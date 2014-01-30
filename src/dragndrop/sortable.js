(function () {

var mod = angular.module('optng.dragndrop.sortable', [
	'optng.dragndrop'
]);


mod.directive(
//////////////
'optSortable',
//////////////
/**
 *	@directive opt-sortable
 */
['$compile', '$log', '$animate', '$optng.dragndrop',
function ($compile, $log, $animate, $dnd) {

	// since we can drag *across*
	var _placeholder = null;

	return {
		restrict: 'A',
		replace: false,
		// The following is important ; we want this directive to be
		// the *first* and *only* one to run on this node, as we're
		// going to add _new directives_ on its elements
		priority: 1001, // priority is set *above* ngRepeat.
		terminal: true,
		// This directive has its own scope to deal with custom functions
		// that we don't want to pollute the current scope with.
		scope: true,
		// Compile function that will add the new directives.
		compile: function (elt, attrs) {

			if (!attrs.ngRepeat) {
				$log.error('opt-sortable must be used in conjunction with an ng-repeat');
				return;
			}

			// Get the mimetype we're handling or create an arbitrary one.
			var drag_mime = attrs.dragMime || 'false-mime/' + $dnd.getNewId();

			if (!elt.attr('drag-mime'))
				elt.attr('drag-mime', drag_mime);

			// "parse" the ngRepeat directive to know the full name of the collection
			// in the scope and the name of the value.
			var parts = attrs.ngRepeat.split(' in ');
			var collection = parts[1].trim();
			var value = parts[0].trim();

			if (value[0] === '(') {
				// when in the case of '(key, value)'
				value = value.slice(1, -1) // remove parentheses
					.split(',')[1].trim();
			}

			// used to know what kind of placeholder to create.
			var nodeName = elt[0].nodeName;

			elt.attr('opt-draggable', true);
			elt.attr('opt-draggable-over', true);

			// tell before doing anything to the metadata that
			elt.attr('on-drag-started', '$dragStart(' + value + ', ' + collection + ', $index, $drag)');

			// we are accepting a drag over this element just to create a placeholder
			elt.attr('on-drag-accepted', '$dragAccept($element, $index, $drag)');

			// remove the element from the collection if the dragged item was accepted
			// somewhere.
			elt.attr('on-drop-accepted', '$dropAccept($drag)');

			// we do not want this directive to re-run once it has been
			// executed, so we remove it from the attributes so that we can recompile
			// the current element.
			elt.removeAttr('opt-sortable');

			return function postLink(scope, elt, attrs) {
				// Re-run the compile phase on the now modified element.
				$compile(elt)(scope);

				var container = elt.parent();

				container.on('dragover' , function (event) {
					var dt = (event.originalEvent || event).dataTransfer;

					var datas = $dnd.getDatasForEvent(dt, drag_mime);

					if (datas && datas.length) {
						event.stopPropagation();
						event.preventDefault();
					}
				});

				container.on('drop', function (event) {
					var dt = (event.originalEvent || event).dataTransfer;

					var datas = $dnd.getDatasForEvent(dt, drag_mime);

					if (datas && datas.length) {
						var $drag = datas[0];

						$drag.src_collection.splice($drag.src_index, 1);

						if ($drag.src_collection === $drag.dst_collection &&
								$drag.src_index < $drag.dst_index) {
							// if the collection in which we insert the data is the same
							// than the one we take it from, and if its original position
							// was lower than the insertion, then we have to substract 1 to
							// the destination index, since it has shifted.
							// $drag.dst_index -= 1;
						}

						// insert the element in the resulting collection.
						$drag.dst_collection.splice($drag.dst_index, 0, $drag.data);

						event.stopPropagation();
						event.preventDefault();

						scope.$apply();
					}

				});

				scope.$on('$destroy', function () {
					container.off('dragover drop');
				})

				scope.$dragStart = function (value, collection, $index, $drag) {
					angular.extend($drag, {
						data: $drag.data || value,
						dst_index: $index,
						dst_collection: collection,
						src_index: $index,
						src_collection: collection
					});

					// // create a new placeholder for this element, and hide the element
				};

				scope.$dragAccept = function ($element, $index, $drag) {
					// Create the placeholder and remove it from the $drag element
					// if applicable.

					var elt_scope = $element.scope();

					current_placeholder = angular.element('<' + nodeName + '>')
						.addClass('opt-drag-placeholder')
						.html('&nbsp;');

					// $compile(current_placeholder)(scope);

					if ($drag.getPlaceHolder()[0] === $element.next()[0]) { // coming back
						$drag.getPlaceHolder().after($element);
						$drag.dst_index = elt_scope.$index;
					} else {
						$element.after($drag.getPlaceHolder());
						$drag.dst_index = elt_scope.$index;
					}

					$drag.getPlaceHolder().after(current_placeholder);

					// tell the DragData that we now have a placeholder.
					$drag.setPlaceHolder(current_placeholder);

				};

			}; //! postLink fn
		} //! compile fn
	}; //! directive

}]);

})();