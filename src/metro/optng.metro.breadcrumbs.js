(function () {

var module = angular.module('optng.metro.breadcrumbs', [
	'ng'
]);

module.factory(
'$optng.metro.breadcrumbs',
['$animate',
function ($animate) {

	var ul = angular.element('<ul class="breadcrumbs">');
	var _bcs = [];

	return {
		remove: function (bc) {
			var id = _bcs.indexOf(bc);
			if (id > -1)
				_bcs.splice(id, 1);

			if (bc.$element)
				$animate.leave(bc.$element.parent());
		},

		add: function (bc) {
			var li = angular.element('<li>');
			bc.fn(bc.scope, function (clone) {
				li.append(clone);
				bc.$element = clone;
			});

			$animate.enter(li, ul);
		},

		getUl: function () {
			return ul;
		}
	};

}]);

/**
 *	@module optng.metro.breadcrumbs
 *
 *	This module allows one to set breadcrumbs easily.
 *
 *	Set up the global breadcrumbs on the page with the metro-breadcrumbs-container
 *	directive.
 *
 *		<div metro-breadcrumbs-container></div>
 *
 *	Then, use the metro-breadcrumb="<name>" metro-bc-url="<url>" directive anywhere else.
 *
 *	The metro-breadcrumb directive doesn't create scopes, but they use them to communicate.
 *
 *	The breadcrumbs find themselves by using scope signals ($emit,) so make
 *	sure that they are in scopes that are children of one another.
 *
 *	The metro-breadcrumbs directive listens to these events on the root scope,
 *	so it can be placed anywhere withing the document.
 */

module.directive('metroBreadcrumbs', [
'$rootScope', '$optng.metro.breadcrumbs',
function ($root, $bcs) {

	return {
		scope: true,
		link: function (scope, elt, attrs) {

			elt.addClass('breadcrumbs');
			elt.append($bcs.getUl());

		}
	};

}]);


module.directive('metroBreadcrumb', [
'$animate', '$optng.metro.breadcrumbs',
function ($animate, $bcs) {

	return {
		priority: 1000,
		transclude: 'element',
		compile: function (elt, attrs, transclude) {

			return function (scope, elt, attrs) {

				var bc = {
					scope: scope,
					fn: transclude
				};

				$bcs.add(bc);

				scope.$on('$destroy', function () {
					$bcs.remove(bc);
				});
			};

		}
	};

}]);

})();