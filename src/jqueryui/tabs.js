(function () {

var module = angular.module('optng.jqueryui.tabs', [
	'ng',
	'optng.jqueryui.core'
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
module.directive('jqueryuiTabs',
['$optng.jqueryui.factory', '$compile',
function ($factory, $compile) {

	var options = ['active', 'collapsible', 'disabled', 'event', 'heightStyle',
		'hide', 'show',

		// Events
		'activate', 'beforeActivate', 'beforeLoad', 'create', 'load'];

	var methods = ['destroy', 'disable', 'enable', 'load', 'option',
		'refresh', 'widget'];

	return {
		priority: -1,
		link: function (scope, elt, attrs) {
			var _titletpl = $compile('<ul>' +
				'<li ng-repeat="tab in $tabs.tabs">' +
					'<a href="#{{ tab.id }}">{{ tab.title }}<a ng-show="tab.closable" ng-click="$tabs.removeTab(tab.key)" href="javascript://"><i class="icon-remove"></i></a></a>' +
				'</li>' +
			'</ul>');

			elt.prepend(_titletpl(scope));
		},
		scope: true,
		controller: [
		'$scope', '$element', '$attrs',
		function ($scope, $element, $attrs) {

			var alias = $attrs.jqueryuiTabs || '$tabs';

			$scope.$parent[alias] = this;
			$scope['$tabs'] = this;
			this.tabs = [];
			$scope.$tabs.$element = $element;

			// Augment the controller with its methods
			$factory.methods('tabs', this, $element, methods);

			var _options = $factory.parse($attrs, options, $scope);

			function _refresh() {
				setTimeout(function () {
					$scope.$tabs.refresh();
				});
			}

			this.addTab = function (tab, scopeinit) {

				if (!angular.isString(tab) && !angular.isElement(tab)) {
					this.tabs.push(tab);
				} else {
					// tab is in fact a template.
					// Beware that it is *not* cloned and expects a clean
					// template to work with.
					var tpl = angular.element(tab);
					var newscope = $scope.$new();
					if (scopeinit)
						angular.extend(newscope, scopeinit);
					$element.append(tpl);
					$compile(tpl)(newscope);
				}

				// Refresh the tab.
				_refresh();
			}.bind(this);

			this.findTab = function (key) {
				var index = -1;

				angular.forEach(this.tabs, function (tab, id) {
					if (tab.key === key)
						index = id;
				});

				return index;
			}.bind(this);

			this.focusTab = function (key) {
				var index = this.findTab(key);

				if (index > -1) {
					$element.tabs('option', 'active', index);
					return true;
				} else {
					return false;
				}
			}.bind(this);

			this.removeTab = function (key) {
				var index = this.findTab(key);
				var tab = this.tabs[index];
				this.tabs.splice(index, 1);
				$('#' + tab.id).destroy();
				_refresh();
			}.bind(this);

			setTimeout(function () {
				$element.tabs(_options);
			}.bind(this));
		}]
	}

}]);

module.directive('jqueryuiTab', function () {

	var _unique_id = 0;

	return {
		priority: -1,
		scope: true,
		compile: function (elt, attrs, transclude) {

			return function (scope, elt, attrs, tabctrl) {
				var tab = {};
				_unique_id += 1;
				tab.id = 'optng-jqueryui-tab-' + _unique_id;
				tab.title = attrs.jqueryuiTab;
				tab.closable = scope.$eval(typeof attrs.jqueryuiClosable === 'undefined' ? 'false' : attrs.jqueryuiClosable || 'true');
				tab.key = scope.$eval(attrs.jqueryuiKey || 'null') || tab.title;
				elt.attr('id', tab.id);
				scope.$tabs.addTab(tab);
			};

		}
	}

});

})();