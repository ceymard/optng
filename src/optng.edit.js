
/**
	@directive opt-editable

	@description A companion to ng-model, turns any element to
		an html5 editable component that stores its contents into
		the given ng-model variable.
*/
angular.module('optng.edit', ['ng']).directive('optEditable', [
'$rootScope',
function ($root) {

	return {
		restrict: 'A',
		require: '?ngModel',
		link: function(scope, element, attr, ngModel) {

			// The contenteditable attribute must be set on the element
			// for it to actually be editable by the browser.
			element.attr('contenteditable', 'true');

			// If used in conjunction with ng-model, register some logic
			// to update the value of the model.
			if (ngModel) {

				ngModel.$render = function() {
					return element.html(ngModel.$viewValue || '');
				};

				var observer = new MutationObserver(function read(mutations) {
					ngModel.$setViewValue(element.html());
					$root.$apply();
				});

				observer.observe(element[0], {childList: true, subtree: true, characterData: true});
				scope.$on('$destroy', function () { observer.disconnect(); });
			}

		}
	};

}]);

