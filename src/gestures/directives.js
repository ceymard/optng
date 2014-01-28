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
			var gestures = scope.$eval(attrs.optGestures) || {};

			for (name in attrs) {
				if (name[0] === '$' || !attrs.hasOwnProperty(name))
					continue;

				var orig_name = attrs.$attr[name];
				if (orig_name.indexOf('on-') !== 0)
					continue;
				orig_name = orig_name.slice(3);

				var shortcut = orig_name.replace(/-/g, ',').replace(/_/g, '+');
				gestures[shortcut] = attrs[name];
			}

			$gestures(gestures, scope, elt);
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
