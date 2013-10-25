(function () {

var module = angular.module('optng.gridix.dialog', [
	'ng',
	'optng.core.jquery-extensions'
]);

/**
 * 	Create a dialog.
 * 	The dialog *always* creates a new scope ; no need to call scope.$new() before.
 * 	A `close()` function is added to the scope that will close and destroy it.
 *
 * 	@param scope An angular scope.
 * 	@param template A string, an element or a function. If a string
 * 	                or an element, then it is passed through $compile. Otherwise
 * 	                it is assumed it is a transclude-like function.
 */
module.factory('$optng.gridix.dialog',
['$compile', '$rootScope', '$timeout',
function ($compile, $rootScope, $timeout) {
	var body = $('body');

	var dialog_template = $compile()

	/**
	 *	@class gridix.dialog.Dialog
	 *
	 */
	function Dialog (template, scope, options) {
		this.template = angular.isFunction(template) ? template : $compile(template);
		this.scope = scope || $rootScope;
		options = options || {};
		this.modal = options.modal || false;
		this.elt = options.element || body;
	}

	/**
	 *	@method gridix.dialog.Dialog.show
	 *
	 * 	@param init An object that will be merged to the scope of the dialog.
	 */
	Dialog.prototype.show = function (init) {
		var modal = null;

		var cloned = this.template(this.scope.$new(), _.bind(function (clone) {
			if (this.modal) {
				modal = angular.element('<div class="optng-dialog-modal-layer"></div>');
				this.elt.append(modal);
			}

			clone.addClass('optng-dialog');
			this.elt.append(clone);

			var scope = clone.scope();

			// We use timeout to let the controller (if it was defined) create its scope
			// and attach it to the current scope.
			$timeout(function () {

				if (clone.attr('ng-controller'))
					scope = scope.$$childHead; // ng-controller or any other controller create a new scope, and we want to point to it.

				scope.close = function () {
					clone.destroy();
					modal && modal.remove();
				};

				// Calling Jquery-UI's dialog method.
				var options = scope.$eval(clone.attr('options') || '{}');

				_.extend(scope, init);
			});
		}, this));
	};

	return function (template, scope, options) {
		return new Dialog(template, scope, options);
	};
}]);

/**!ngdirective gridix.dialog
 *
 *	Creates a dialog variable in the current scope.
 *
 *	The dialog starts hidden. It can be shown by calling
 *	.show(), as specified by [[gridix.dialog.Dialog]].
 *
 * 	Attributes:
 * 		name: The name of the variable in which the dialog
 * 			will be assigned to.
 */
module.directive('optDialog',
['$optng.gridix.dialog',
function ($dialog) {

	return {
		restrict: 'A',
		transclude: 'element',
		priority: 1000,
		terminal: true,
		compile: function (elt, attrs, transclude) {
			var name = attrs.optDialog;

			if (!name)
				throw new Error('Can not register an unnamed Dialog');

			return function (scope, elt, attrs) {
				scope[name] = $dialog(transclude, scope, {
					element: elt.parent()
				});
			};
		}
	}
}]);

})();