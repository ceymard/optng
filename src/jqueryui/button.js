(function () {

var module = angular.module('optng.jqueryui.button', [
	'ng',
	'optng.jqueryui.core'
]);

var btnDirective = function () {

	return {
		restrict: 'EA',
		controller: [
		'$scope', '$element', '$attrs', '$optng.jqueryui.factory',
		function (scope, elt, attrs, $factory) {
			var options;
			elt.button();
		}]
	}

};

module.directive('button', btnDirective);

})();
