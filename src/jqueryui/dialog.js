(function () {

/*
	Call a dialog from inside a template

	$dialog('dialog-id').show(<init>);

	Register a template as a dialog
	$dialog.register('dialog-id', 'template-id', options);

	When the dialog is about to be closed, an event is broadcast to its scope
	with one argument : the then portion of a promise.
	If an exception is thrown (if the promise is rejected,) the dialog won't
	close.

*/

var module = angular.module('optng.jqueryui.dialog', [
	'ng',
	'optng.jqueryui.dialog.templates',
	'optng.jqueryui.button'
]);


// Dialog creation service.
module.factory(
/*=====================*/
'$optng.jqueryui.dialog.Dialog',
/*=====================*/
['$rootScope', '$templateCache', '$cacheFactory', '$compile', '$q',
function ($root, $templateCache, $cacheFactory, $compile, $q) {

	var body = angular.element(document).find('body');

	var dlg_cache = $cacheFactory('$optng.jqueryui.dialogs');
	var dialog_template = $templateCache.get('$optng.jqueryui.dialog.template');

	//////////////////////////////////

	function Dialog(template, options) {
		var template_transclude = $compile(template);
		var dialog_tpl = $compile(dialog_template, template_transclude);

		angular.extend(this, options);

		this.__template = dialog_tpl;
		this.__element = null;
		this.__scope = null;
	}

	Dialog.register = function register(name, template, options) {
		var dlg = new Dialog(template, options);

		dlg_cache.put(name, dlg);
		return dlg;
	};

	Dialog.get = function get(name) {
		return dlg_cache.get(name);// || throw new Error("No such template `" + name + "`");
	};

	////////////////////////////////////

	Dialog.prototype.show = function show(init) {
		var _this = this;
		// Dialogs are in isolate scope.
		var isolate = $root.$new(true);

		// Inject the initial values into the dialog.
		angular.extend(isolate, init);
		isolate._dialog = this;

		// Append the dialog to the body.
		this.__template(isolate, function (clone, scope) {
			_this.__element = clone;
			_this.__scope = scope;
			body.append(clone);
		});
	};

	Dialog.prototype.destroy = function destroy() {
		this.__scope.$destroy();
		this.__element.remove();
	};

	Dialog.prototype.close = function close(event_name) {
		var deferred = $q.defer();
		var promise = deferred.promise;
		var that = this;
		event_name = event_name || 'dialog.close';

		if (event_name) {
			this.__scope.$broadcast(event_name, function (then, fail) {
				var origpromise = promise;
				promise = promise.then(then, fail);
				return origpromise;
			});
		}

		// If all the promises are resolved and not failed, then we can close the button.
		promise.then(function () {
			that.destroy();
		});

		deferred.resolve(true);
	};

	return Dialog;
}]);

module.directive(
'jquiDialog',
[function () {
	return {
		restrict: 'A',
		priority: 0, // should be way behind the template cache
		link: function (scope, elt, attrs) {

		}
	}
}]);

})();
