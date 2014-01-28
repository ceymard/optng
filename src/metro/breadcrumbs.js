(function () {

var module = angular.module('optng.metro.breadcrumbs', [
	'ng'
]);

/**
 * 	@module optng.metro.breadcrumbs
 *
 *	This module allows one to set breadcrumbs easily.
 *
 *	Set up the global breadcrumbs on the page with the metro-breadcrumbs-container
 *	directive.
 *
 * 		<div metro-breadcrumbs-container></div>
 *
 * 	Then, use the metro-breadcrumb="<name>" metro-bc-url="<url>" directive anywhere else.
 *
 *  The metro-breadcrumb directive doesn't create scopes, but they use them to communicate.
 *
 * 	The breadcrumbs find themselves by using scope signals ($emit,) so make
 * 	sure that they are in scopes that are children of one another.
 *
 * 	The metro-breadcrumbs directive listens to these events on the root scope,
 * 	so it can be placed anywhere withing the document.
 */

module.directive('metroBreadcrumbs', [
'$rootScope',
function ($root) {

	return {
		scope: true,
		link: function (scope, elt, attrs) {
			var ul = angular.element('<ul>');
			var bcs = [];

			elt.append(ul);
			elt.addClass('breadcrumbs');

			// Create the buttons if they don't exist already
			// and add them to the breadcrumbs.
			function refresh() {

				bcs = [];
				$root.$broadcast('$metroBreadcrumbsGet', bcs);

				angular.forEach(bcs, function (bc) {
					var li = null;

					if (bc.$element)
						ul.append(bc.$element);
					else {
						li = angular.element('<li>');

						ul.append(li);

						bc.fn(bc.scope, function (clone) {
							li.append(clone);
						});
						bc.$element = li;
					}
				});

			}

			var refresh = _.debounce(refresh);

			$root.$on('$metroBreadcrumbAdded', refresh);
			$root.$on('$metroBreadcrumbRemoved', refresh);
		}
	};

}]);


module.directive('metroBreadcrumb', [
function (ObserverGroup) {

	return {
		priority: 1000,
		transclude: 'element',
		compile: function (elt, attrs, transclude) {

			return function (scope, elt, attrs) {

				var bc = {
					scope: scope,
					fn: transclude
				}

				scope.$on('$metroBreadcrumbsGet', function (event, bcs) {
					bcs.push(bc);
				});

				scope.$on('$destroy', function () {

					// remove the element from the DOM if the scope
					// is being destroyed.
					if (bc.$element)
						bc.$element.remove();

					scope.$emit('$metroBreadcrumbRemoved', bc);
				});

				scope.$emit('$metroBreadcrumbAdded', bc);
			};

		}
	};

}]);

module.directive('routeHref', [
'$timeout',
function ($timeout) {
	return {
		link: function (scope, elt, attrs) {
			function update() {
				var path = scope.$route.basepath + attrs.routeHref;
				if ('#' + path === location.hash) {
					elt.parent().addClass('active');
				}
				else
					elt.parent().removeClass('active');
			}

			if (elt.parent()[0].nodeName === 'LI') {
				angular.element(window).on('hashchange', function () {
					$timeout(update);
				});
			}
			$timeout(update);
		}
	}
}]);

})();