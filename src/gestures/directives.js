(function () {

var module = angular.module('optng.gestures.directives', ['ng', 'optng.gestures.service']);

/**
	@directive gestures

	@example
		<input type="text" gestures="{
				'Alt+Shift+A': 'runfunc()',
				'Alt+Shift+B': 'runanotherfunc()'
			}">
*/
module.directive('optGestures',
['$optng.gestures',
function ($gestures) {
	return {
		restrict: 'A',
		link: function (scope, elt, attrs) {
			$gestures(attrs.optGestures, scope, elt);
		}
	};
}]);


module.directive('optClick',
['$optng.gestures',
function ($helper) {
	return {
		restrict: 'A',
		link: function (scope, elt, attrs) {
			$helper({'click': attrs.optClick}, scope, elt);
		}
	}
}]);


/**
	@directive global-gestures

	@see gestures
*/
module.directive('optGlobalGestures',
['$optng.gestures',
function ($gestures) {

	return {
		restrict: 'A',
		link: function (scope, elt, attrs) {
			// no elt.
			$gestures(attrs.optGlobalGestures, scope);
		}
	};

}]);

})();
