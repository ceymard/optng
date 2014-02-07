(function (window, angular) {

var module = angular.module('optng.router', [
	'ng'
]);

module.provider(
/********************/
'$optng.router.Route',
/********************/
function () {

	var _names = {};
	var provider = this;
	var re_valid_name = /^[-$_a-zA-Z0-9]+$/;

	function addName(name, url) {
		if (_names[name]) {
			throw new Error('a route with the name "' + name + '" already exists');
		}

		_names[name] = url;
	}

	this.register = function register (names, name_prefix, url_prefix) {
		var that = this;
		name_prefix = name_prefix || '';
		url_prefix = url_prefix || '';

		if (angular.isString(names)) {
			names = {names: name_prefix};
			name_prefix = '';
		}

		angular.forEach(names, function (url, name) {
			var full_name = name_prefix ? name_prefix + '.' + name : name,
				full_url = url_prefix;

			if (angular.isArray(url)) {
				full_url += url[0];
				addName(full_name, full_url);
				that.register(url[1], full_name, full_url)
			} else {
				full_url += url;
				addName(full_name, full_url);
			}
		});

	};

	this.unregister = function unregister (name) {
		delete _names[name];
	};

	this.$get = ['$log', '$timeout', '$location',
	function ($log, $timeout, $location) {

		function Route (route) {

			// FIXME : parse route definition.
			this.params = {};
			this.route = _names[route] || route || '';

			var groups = this.groups = {};
			this.parent = null;
			this.children = [];
			this.last_match = null;
			this._listeners = {};

			var re_groups = /:[^\/]+/g;
			var index = 1;

			this.path = new RegExp('^' + this.route.replace(re_groups, function (match) {
				match = match.slice(1); // remove leading ':'
				groups[match] = index;
				index++;
				return "([^\/]+)";
				}));
		}

		Route.prototype = {

			/**
			 *
			 */
			$new: function (route) {

				if (!_names[route])
					route = this.route + route;

				var new_route = new Route(route);
				new_route.parent = this;
				this.addChild(new_route);

				return new_route;
			},

			addChild: function addChild (child) {
				this.children.push(child);
				var that = this;

				if (this.last_match)
					$timeout(function () {
						child.handle(that.last_path);
					});

				return this;
			},

			removeChild: function removeChild(child) {
				var index = this.children.indexOf(child);
				if (index > -1)
					this.children.splice(index, 1);
				return this;
			},

			/**
			 *
			 */
			destroy: function () {
				if (this.parent)
					this.parent.removeChild(this);

				this.parent = null;
			},

			/**
			 *
			 */
			goto: function (name, args) {
				// named urls
				args = angular.extend({}, this.params, args || {});
				var route = _names[name] || name;

				if (!route) {
					throw new Error('no route for name "' + name + '" and args', args);
				}

				var url = route.replace(/:[^\/]+/g, function (match) {
					var name = match.slice(1);
					if (!args[name])
						throw new Error('missing argument "' + name + '" for ' + route);
					return '' + args[name];
				}).replace(/(\$$|\?)/g, '');

				$location.path(url);
			},

			/**
			 *
			 */
			handle: function handle (path) {

				var match = this.path.exec(path);

				if (!match) {
					this.last_match = null;
					this.last_matched = false;
					this.last_path = null;
					this.trigger('nomatch');
					return;
				}

				if (match[0] !== this.last_match) {
					this.last_path = path;
					this.last_matched = true;

					var params = this.params = {};

					angular.forEach(this.groups, function (index, key) {
						params[key] = match[index];
					});

					this.trigger('changed');
				}

				this.last_match = match[0];

				angular.forEach(this.children, function (child) {
					child.handle(path);
				});

			},

			register: function (name) {
				this.name = name;
				provider.register({name: this.fullpath_definition});
			},

			unregister: function () {
				provider.unregister(this.name);
			},

			on: function (name, fn) {
				if (!this._listeners[name])
					this._listeners[name] = [];
				this._listeners[name].push(fn);
			},

			off: function (name, fn) {
				if (!this._listeners[name])
					return;

				if (!fn)
					delete this._listeners[name]
				else {
					// find the function in the listeners and remove it.
					var list = this._listeners[name];
					do {
						var index = list.indexOf(fn);
						if (index > -1)
							list.splice(index, 1);
					} while (index > -1)
				}
			},

			trigger: function (name) {
				var args = Array.prototype.slice.call(arguments, 1);

				var listeners = this._listeners[name] || [];
				var that = this;

				angular.forEach(listeners, function (l) {
					l.apply(that, args);
				});
			}

		}; //! Route.prototype

		return Route;
	}];

});

/**
 *	@directive optng-route
 */
module.directive('optRoute', [
'$templateCache', '$animate', '$compile', '$rootScope',
'$timeout', '$http', '$location', '$optng.router.Route',
function ($templateCache, $animate, $compile, $root, $timeout, $http, $location, Route) {
	var lasthash = null;

	$root.$route = new Route();

	$root.$on('$locationChangeStart', function (pwet) {
		$root.$route.handle($location.url());
	})

	return {
		priority: 999, //higher than ng-include, but lower than ngRepeat
		transclude: 'element',
		terminal: true,

		restrict: 'A',
		scope: true,
		$$tlb: true, // special case to avoid errors on multiple transclusion.
		link: function (scope, elt, attrs, ctrl, $transclude) {
			// These variables hold the last generated elements / scopes
			// for the given route.
			var current_element = null;
			var end_element = null;
			var current_scope = null;
			var optRoute = attrs.optRoute;

			// Create a child $route in the scope.
			var $route = scope.$route.$new(attrs.optRoute);
			scope.$route = $route;

			if (attrs.routeName)
				$route.register(attrs.routeName);

			function cleanup () {
				if (current_scope) {
					current_scope.$destroy();

					var iter = current_element;

					while (iter && iter !== end_element) {
						var next = iter.nextSibling;
						if (iter.nodeType === document.ELEMENT_NODE)
							$animate.leave(angular.element(iter));
						else
							angular.element(iter).remove();
						iter = next;
					}
					current_element = current_scope = null;
				}
			}

			$route.on('nomatch', function () {
				cleanup();
			});

			$route.on('changed', function () {
				// if the route has effectively changed at a local level,
				// then we need to re-evaluate anything that was in our element.
				cleanup();
				current_scope = scope.$new();

				$transclude(current_scope, function (clone) {
					// insert the contents right after the comment
					// left by this directive.

					clone[clone.length++] = document.createComment(' end optRoute: ' + attrs.optRoute + ' ');
					end_element = clone[clone.length - 1];
					current_element = clone[0];
					$animate.enter(clone, null, elt);
				});

			});
		}
	};

}]);

})(window, window.angular); // ! module
