(function () {

var module = angular.module('optng.gridix.tabs', [
	'ng',
	'optng.core.jquery-extensions'
]);

module.directive('optTabs', [
'$compile',
function ($compile) {

	var _template = $compile('<ul>' +
			'<li ng-repeat="tab in tabs">' +
				'<a ng-click="show_tab(tab)" href="javascript://">{{ tab.label }}</a>' +
			'</li>' +
		'</ul>' +
		'<div class="optng-tab"></div>'
	);

	return {
		restrict: 'A',
		controller: ['$scope', '$element',
		function ($scope, elt) {
			$scope.tabs = [];
			var holder = null;
			var current_element = null;

			var template = _template($scope, function (clone) {
				elt.append(clone);
				holder = angular.element(clone[1]);
			});

			$scope.show_tab = function (tab) {
				if (current_element && current_element === tab.elt)
					// No need if we're already showing the correct tab.
					return;

				if (current_element)
					current_element.destroy();

				tab.fn($scope, function (clone) {
					current_element = clone;
					holder.append(current_element);
				});
			};

			/**
			 * Rajoute un panel aux tabs.
			 * @param {[type]} pane [description]
			 */
			this.addPane = function (title, transclude) {
				if (angular.isString(transclude) || angular.isElement(transclude))
					transclude = $compile(transclude);

				$scope.tabs.push({
					label: title,
					fn: transclude,
					elt: null
				});

			};

		}]
	};
}]);

/**
 *
 */
module.directive('optTab', function () {
	var id = 0;

	return {
		require: '^optTabs',
		restrict: 'A',
		transclude: 'element',
		// La ligne suivante indique que l'on veut que l'attribut title
		// de la node originale soit chargée dans notre scope en tant que
		// variable.
		compile: function (elt, attrs, transclude) {
			return function (scope, elt, attrs, tabsCtrl) {
				var title = attrs.optTab || attrs.title;
				tabsCtrl.addPane(title, transclude);
			};
		}
	};
});


})();