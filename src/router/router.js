(function (window, angular) {

if (!window.URI)
	throw new Error('No URI.js detected ; optng.router needs it for URI manipulation.');

var module = angular.module('optng.router', ['ng']);


/**
 *	@directive optng-route
 */
module.directive('optngRoute', [
'$templateCache', '$animate', '$compile', '$rootScope', '$timeout', '$http',
function ($templateCache, $animate, $compile, $root, $timeout, $http) {
	var lasthash = null;

	var update = function () {
		var hash = location.hash;

		if (hash) {
			if (hash === lasthash)
				return;
			lasthash = hash;

			hash = hash.slice(1); // Remove the leading '#'
			var url = URI(hash);
			var path = url.path();
			var query = URI.parseQuery(url.search());

			$root.$route = {
				path: path,
				query: query,
				fullpath: path,
				basepath: '',
				params: {}
			};

			$root.$broadcast('$optngRouteChange', null);
		}
	};

	var debounced_update = _.debounce(update);

	$(window).on('hashchange', function () {
		$timeout(update)
	});

	return {
		priority: 1000,
		restrict: 'A',
		transclude: 'element',
		scope: true,
		compile: function (elt, attrs, transclude) {
			var when = attrs.when || 'true',
				route = attrs.optngRoute || attrs.route || '',
				src = attrs.src || null, // src is optional, as we can transclude.
				groups = [];

			route = route.replace(/:[^\/]+/g, function (match) {
				match = match.slice(1); // remove the ':'
				groups.push(match);
				return '([^\\/]+)';
			});

			route = new RegExp('^' + route);

			return function (scope, elt, attrs, routers) {
				var currentElement = null;
				var currentScope = null;
				var current_route_ref = {parent: null};

				function broadcast(newroute) {
					$timeout(function () {
						currentScope.$route = newroute;
						scope.$broadcast('$optngRouteChange', current_route_ref);
					});
				}

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
					var scopesrc = scope.$eval(src);

					// Ignore events coming from another router than our parent.
					if (parent !== current_route_ref.parent)
						return;

					var match = route.exec(path);

					if (match) {
						var newroute = {
							path: path.replace(match[0], ''),
							query: $route.query,
							fullpath: $route.fullpath,
							basepath: $route.basepath + match[0],
							params: angular.copy($route.params, {})
						};

						angular.forEach(groups, function (name, i) {
							newroute.params[name] = match[i + 1];
						});

						if (!currentElement) {
							currentScope = scope.$new();
							currentScope.$route = newroute;

							transclude(currentScope, function (clone) {
								// Add the newly compiled element right after either the comment left
								// by transclude: 'element', or the previous element if it existed,
								// so that we can trigger the animations as needed.
								$animate.enter(clone, null, currentElement || elt);
								currentElement = clone;

								if (scopesrc) {

									$http.get(scopesrc, {cache: $templateCache}).success(function(response) {
										clone.html(response);
										$compile(clone.contents())(currentScope);
										broadcast(newroute);
									});

								} else
									broadcast(newroute);
							});


						} else
							broadcast(newroute);

					} else {
						if (currentElement) {
							currentScope.$destroy();
							$animate.leave(currentElement);
							currentScope = null;
							currentElement = null;
						}
					}

				});

				debounced_update();
			}
		}
	};

}]);

module.directive('routeHref',
['$timeout',
function ($timeout) {
	return {
		// priority: 0,
		compile: function (elt, attrs) {
			return function (scope, elt, attrs) {
				elt.attr('href', 'javascript://');

				scope.$watch('$route', function (val) {
					// elt.attr('href', '#' + val.basepath + attrs.routeHref);
				});

				elt.on('click', function () {
					$timeout(function () {
						// $(window).trigger('hashchange');
						location.hash = scope.$route.basepath + attrs.routeHref;
					});
				});
			}
		}
	}

}]);

})(window, window.angular); // ! module
