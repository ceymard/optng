(function () {

if (!window.URI)
	throw new Error('No URI.js detected ; optng.router needs it for URI manipulation.');

var module = angular.module('optng.router', ['ng']);


/**
 *	@directive optng-route
 */
module.directive('optngRoute', [
'$templateCache', '$animate', '$compile', '$rootScope',
function ($templateCache, $animate, $compile, $root) {

	var update = _.debounce(function update() {
		var hash = location.hash;

		if (hash) {
			hash = hash.slice(1); // Remove the leading '#'
			var url = URI(hash);
			var path = url.path();
			var query = URI.parseQuery(url.search());

			$root.$route = {
				path: path,
				query: query,
				fullpath: path,
				basepath: ''
			};

			$root.$broadcast('$optngRouteChange', null);
			$root.$apply();
		}
	}, 20);

	$(window).on('hashchange', update);

	return {
		restrict: 'A',
		transclude: 'element',
		scope: true,
		compile: function (elt, attrs, transclude) {
			var when = attrs.when || 'true',
				route = attrs.optngRoute || attrs.route || '',
				src = attrs.src || null; // src is optional, as we can transclude.

			route = route.replace(/:[^\/]+/g, function (match) {
				match = match.slice(1); // remove the ':'
				var name = match;
				return '([^\\/]+)';
			});

			route = new RegExp('^' + route);

			return function (scope, elt, attrs, routers) {
				var currentElement = null;
				var currentScope = null;
				var current_route_ref = {parent: null};

				// Simple mechanism to know which router emited the event.
				scope.$emit('$optngRouteRegister', current_route_ref);
				scope.$on('$optngRouteRegister', function (event, childref) {
					if (childref === current_route_ref) // we do not want to handle ourselves.
						return;

					// first scope to catch this event is a route and stops the
					// propagation.
					event.stopPropagation();
					childref.parent = current_route_ref;
				});

				scope.$on('$optngRouteChange', function (event, parent) {
					var $route = scope.$route;
					var path = $route.path;

					// Ignore events coming from another router than our parent.
					if (parent !== current_route_ref.parent)
						return;

					var match = route.exec(path);

					if (match) {

						var newroute = {
							path: path.replace(match[0], ''),
							query: $route.query,
							fullpath: $route.fullpath,
							basepath: $route.basepath + match[0]
						};

						if (!currentElement) {
							currentScope = scope.$new();

							var clone = transclude(currentScope);

							// Add the newly compiled element right after either the comment left
							// by transclude: 'element', or the previous element if it existed,
							// so that we can trigger the animations as needed.
							$animate.enter(clone, null, currentElement || elt);
							currentElement = clone;
						}

						currentScope.$route = newroute;
						scope.$broadcast('$optngRouteChange', current_route_ref);
					} else {
						if (currentElement) {
							currentScope.$destroy();
							$animate.leave(currentElement);
							currentScope = null;
							currentElement = null;
						}
					}

				});

				update();
			}
		}
	};

}]);

module.directive('routeHref', function () {
	return {
		compile: function (elt, attrs) {
			return function (scope, elt, attrs) {
				scope.$watch('$route', function (val) {
					elt.attr('href', '#' + val.basepath + attrs.routeHref);
				});
			}
		}
	}

});

})(); // ! module
