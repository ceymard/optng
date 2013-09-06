(function () {

var module = angular.module('optng.gestures.directives', ['ng', 'optng.gestures.service']);

function _parse_gestures(gestures_str, chain, scope, $parse) {
	// Shortcuts and their
	var shortcuts = scope.$eval(gestures_str);

	_.each(shortcuts, function (action, gesture) {
		// 'compile' the gesture.
		var expression = $parse(action)
		action = function (locals) {
			expression(scope, locals);
			scope.$apply();
		};

		chain.addGesture(gesture, action);
	});

	// Remove the gestures on scope destructions.
	scope.$on('$destroy', function () {
		chain.removeMultipleGestures(shortcuts)
	});

}

/**
	@directive gestures

	@example
		<input type="text" gestures="{
				'Alt+Shift+A': 'runfunc()',
				'Alt+Shift+B': 'runanotherfunc()'
			}">
*/
module.directive('gestures',
['$optng.gestures.GestureHandler', '$parse',
function (GestureHandler, $parse) {
	return {
		restrict: 'A',
		link: function (scope, elt, attrs) {
			var chain = new GestureHandler();
			_parse_gestures(attrs.gestures, chain, scope, $parse);

			function _handleEvent(event) {
				if (chain.check(event))
					// Stop bubbling if we detected a gesture.
					return false;
			}

			elt.on('keydown', _handleEvent);
			elt.on('mouseup', _handleEvent);

			// Perform event cleanup.
			scope.$on('$destroy', function () {
				elt.off('keydown', _handleEvent);
				elt.off('mouseup', _handleEvent);
			});
		}
	};
}]);


/**
	@directive global-gestures

	@see gestures
*/
module.directive('globalGestures',
['$optng.gestures', '$parse',
function ($gestures, $parse) {

	return {
		restrict: 'A',
		link: function (scope, elt, attrs) {
			_parse_gestures(attrs.globalGestures, $gestures, scope, $parse);
		}
	};

}]);

})();
