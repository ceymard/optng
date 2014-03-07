(function () {

/*
	Call a dialog from inside a template

	$dialog('dialog-id').show(<init>);

	Register a template as a dialog
	$dialog.register('dialog-id', 'template-id', options);

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
['$rootScope', '$templateCache', '$cacheFactory', '$http', '$compile',
function ($root, $templateCache, $cacheFactory, $http, $compile) {

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

	Dialog.prototype.close = function close() {
		this.__scope.$destroy();
		this.__element.remove();
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
