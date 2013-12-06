(function () {
/**
 *	@module  optng.graphmaker
 *
 * 	Builds graphs using the graphmaker library.
 */

var module = angular.module('optng.graphmaker', ['ng']);

/**
 *	@directive optng-graphmaker
 *	@scope
 *
 * 	Builds
 */
module.directive('optngGraphmaker', function () {

	return {
		restrict: 'A',
		scope: true,
		link: function (scope, elt, attrs) {

		}
	}

});

})();