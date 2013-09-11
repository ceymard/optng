(function () {

'use strict';

var module = angular.module('optng.gridix.ajaxload', ['ng', 'optng.core']);

/**
	@directive opt-load-indicator

  	@description
  		A Simpler version of the @directive-link[opt-load] directive,
	  	this one just displays an overlay with the indicator.

*/
module.directive('optLoadIndicator',
['$optng.core.baseUrl',
function (baseUrl) {

	return {
		restrict: 'A',
		controller: function ($scope, $element, $attrs) {
			var last_promise = null;
			var overlay = null;
			var unregister = null;

			function reset() {
				if (overlay)
					overlay.remove();
			}

			function createOverlay(color) {
				$element.css('position', 'relative');
				var width = $element.outerWidth(),
					height = $element.outerHeight();

				color = color || 'rgba(0, 0, 0, 0.25)';

				overlay = $('<div class="loading-overlay"></div>');
				overlay.css('width', width + 'px');
				overlay.css('height', height + 'px');
				overlay.css('background', color);
				overlay.css('top', '0');
				overlay.css('position', 'absolute');

				$element.append(overlay);
			}

			$attrs.$observe('optLoadIndicator', function (varname) {
				unregister && unregister();

				unregister = $scope.$watch(varname, function () {
					var promise = $scope[varname];

					if (promise === last_promise) {
						return;
					}
					last_promise = promise;

					reset();

					// We don't handle that case.
					if (!promise || !promise.then || !(typeof promise.then === 'function'))
						return;

					createOverlay();
					var a = $('<a href="javascript://"><img src="' + baseUrl + '/img/ajax-loader-boxes.gif">&nbsp;&nbsp;Loading</div>');
					overlay.append(a);
					a.css('position', 'absolute');
					a.css('top', (overlay.outerHeight() - a.outerHeight()) / 2);
					a.css('left', (overlay.outerWidth() - a.outerWidth()) / 2);

					promise.then(function (result) {
						reset();

						return result;
					}, function (reason) {
						reset();
						createOverlay('rgba(60, 15, 15, 0.8)');
						var a = $('<a href="javascript://" class="error">#Error</div>');
						overlay.append(a);
						a.css('position', 'absolute');
						a.css('top', (overlay.outerHeight() - a.outerHeight()) / 2);
						a.css('left', (overlay.outerWidth() - a.outerWidth()) / 2);

						a.click(function () {
							var popup = window.open('', 'Error', 'height=600,width=800,toolbar=no,' +
								'directories=no,status=no,menubar=no');
							popup.focus();
							var pretty = $(prettyPrint(reason, {maxDepth: 1}));
							var body = $(popup.document).find('body');
							body.html('');
							body.append(pretty);
						});

						// show error.
						return reason;
					});
				});
			});
		}
	}

}]);

/**
	@directive opt-load

	@description Does stuff.

	@attribute on: An expression that evals to a promise
*/
module.directive('optLoad',
['$optng.core.baseUrl',
function (baseUrl) {
	return {
		restrict: 'E',
		replace: true,
		template: '<span></span>',
		transclude: true,
		compile: function (elt, attrs, transclude) {
			return function (scope, elt, attrs) {
				var last_promise = null;
				var newscope = scope.$new();

				function cleanUp() {
					// On nettoie les scopes enfants vu qu'on supprime les éléments
					// auxquels ils peuvent être associés.
					var childscope = newscope.$$childHead,
						next = null;

					while (childscope) {
						next = childscope.$$nextSibling
						childscope.$destroy();
						childscope = next;
					}
					// On peut enfin supprimer les éléments du DOM d'avant.
					elt.children().remove(); // On supprime le dessin
				}

				scope.$watch(attrs.on, function (val) {
					// If the variable is not a promise, we just do as if it was
					// a resolved one.
					if (!scope[attrs.on] || !(typeof scope[attrs.on].then === 'function')) {
						return;
					}

					// If we already handled that promise, then we don't want to execute
					// the then() block again.
					// Angular can in fact send several $watch for the promise, one when
					// the scope variable first changed, and another when its value
					// was resolved, thus executing the then() block twice.
					if (scope[attrs.on] === last_promise) {
						return;
					}

					last_promise = scope[attrs.on];

					// display the loding animation.
					var img = $('<span>Loading <img style="height: 1em; vertical-align: center;" src="' + baseUrl + '/img/ajax-loader.gif"></span>');
					cleanUp();
					elt.append(img);

					scope[attrs.on].then(function (res) {
						cleanUp();
						transclude(newscope, function (clone) {
							elt.append(clone);
						});

						// On continue de propager le résultat.
						return res;
					}, function (reason) {
						// cas d'erreur
						cleanUp();

						var a = $('<a href="javascript://" class="error">#Loading Error!</div>');
						elt.append(a);

						a.click(function () {
							var popup = window.open('', 'Error', 'height=600,width=800,toolbar=no,' +
								'directories=no,status=no,menubar=no');
							popup.focus();
							var pretty = $(prettyPrint(reason, {maxDepth: 1}));
							var body = $(popup.document).find('body');
							body.html('');
							body.append(pretty);
						});
						return reason; // on propage l'erreur
					});
				});
			};

		}
	};
}]);

})();

