(function () {

var module = angular.module('optng.jqueryui.tabs', [
	'ng',
	'optng.jqueryui.core',
	'optng.jqueryui.tabs.templates'
]);

/**
	@directive scope=true jqueryui-tabs

	@description
		Makes jquery-ui tabs easier to use and more angular-ish.
		Tabs are declared with the jqueryui-tab directive. They
		should declare a key (jqueryui-key) to help manipulating
		them afterwards.

		Creates the @code[$tabs] variable in the scope, which is in
		fact the controller. It supports all the methods of the tabs
		object, and adds a few.

		addTab(tab)

		focusTab(key)

		removeTab(key)
*/
module.directive('jquiTabs',
['$compile', '$templateCache', '$animate', '$timeout',
function ($compile, $tc, $animate, $timeout) {

	var template = $compile($tc.get('$optng.jqueryui.tab.template'));

	return {
		controller: [
			'$scope', '$element',
			function ($scope, $element) {
				var list_clone = null;
				var ctrl = this;
				var current_tab_element = null;

				ctrl.current = null;

				$element.addClass('ui-tabs');

				template($scope, function (_list_clone) {
					// console.log($element, list_clone);
					// $element.prepend(list_clone);
					list_clone = _list_clone;
					$element.append(list_clone);
				});

				$scope._tabs = this;

				ctrl.tabs = [];

				ctrl.addTab = function addTab(tab) {
					tab.element = null;

					if (!ctrl.current) {

						$timeout(function () {
							ctrl.focusTab(tab);
						});

						ctrl.current = tab;
					}

					ctrl.tabs.push(tab);
					// clone.after(tab.element);

				};

				ctrl.focusTab = function focusTab(tab) {

					if (ctrl.current.element) {
						$animate.leave(ctrl.current.element);
						ctrl.current.element = null;
					}

					var current = ctrl.current = tab;

					current.transclude(current.scope, function (tab_clone) {
						$animate.enter(tab_clone, $element, list_clone);
						current.element = tab_clone;
						tab_clone.addClass('ui-tabs-panel');
					});
					// fixme
				};

			}
		]
	};

}]);


module.directive('jquiTab', function () {

	return {
		require: '^jquiTabs',
		transclude: 'element',
		compile: function (elt, attrs, transclude) {
			elt.addClass('ui-tabs-panel');

			return function (scope, elt, attrs, ctrl) {

				ctrl.addTab({
					title: attrs.title,
					transclude: transclude,
					scope: scope
				});
			}
		}
	};

});

})();