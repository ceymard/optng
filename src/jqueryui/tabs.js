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
['$compile',
function ($compile) {

	var _tpl = $compile(
		'<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">' +
			'<li ng-class="{\'ui-state-hover\': hovering, \'ui-state-active\': tab === $tabs.$tab}" ng-repeat="tab in $tabs.tabs" class="ui-state-default ui-corner-top">' +
				'<a' +
				' class="ui-tabs-anchor"href="javascript://" ng-mouseenter="hovering = true" ng-mouseleave="hovering = false" ng-click="tab.focus()">' +
					'{{ tab.title }} ' +
					'<i class="icon-remove" ng-show="tab.closable" ng-click="tab.remove()"></i>' +
				'</a>' +
			'</li>' +
		'</ul>' +
		'<div class="ui-tabs-panel ui-widget-content ui-corner-bottom">' +
			'<div ng-include="$tabs.$tab.template"></div>' +
		'</div>'
	);

	return {
		priority: -1,
		scope: true,
		controller: [
		'$scope', '$element', '$attrs',
		function ($scope, $element, $attrs) {
			$element.addClass('ui-tabs');
			$element.addClass('ui-widget');
			$element.addClass('ui-widget-content');
			$element.addClass('ui-corner-all');

			$scope.$tabs = this;
			this.$tab = null;
			this.$last_tab = null;

			// Create all the controls.
			_tpl($scope, function (clone) {
				$element.prepend(clone);
			});

			this.tabs = [];

			this.addTab = function (tab, scopeinit) {
				if (!this.$tab) {
					this.$tab = tab;
					this.$last_tab = tab;
				}

				tab.$parent = this;
				this.tabs.push(tab);
			}.bind(this);

			this.findTab = function (key) {
				var index = -1;

				angular.forEach(this.tabs, function (tab, id) {
					if (tab === key)
						index = id;
				});

				return index;
			}.bind(this);

			this.focus = function (tab) {
				var index = this.findTab(tab);

				if (index > -1) {
					if (this.$last_tab != this.$tab) this.$last_tab = this.$tab;
					this.$tab = this.tabs[index];
					return true;
				}

				return false;
			}.bind(this);

			this.remove = function (tab) {
				var index = this.findTab(tab);
				this.tabs.splice(index, 1);
				$scope.$tab = this.$last_tab || this.tabs[Math.min(index, this.tabs.length - 1)];
				$scope.$tab.focus();
				this.$last_tab = null;
			}.bind(this);

		}]
	}

}]);


module.directive('jqueryuiTabDefault', function () {

	return {
		require: 'jqueryuiTab',
		link: function (scope, elt, attrs) {
			// Select the tab by default.
		}
	}

});


module.directive('jqueryuiTabClosable', function () {
	return {
		require: 'jqueryuiTab',
		link: function (scope, elt, attrs, tabctrl) {
			tabctrl.closable = true;
		}
	}
});


module.factory('$optng.jqueryui.Tab', function () {
	var _unique_id = 0;

	function Tab(v) {
		this.$parent = null;
		this.title = 'Tab ' + _unique_id++;
		this.closable = false;
		this.template = null;

		angular.forEach(v, function (value, key) {
			this[key] = value;
		}.bind(this));
	}

	Tab.prototype = {
		remove: function remove_tab() {
			this.$parent.remove(this);
		},
		focus: function focus_tab() {
			this.$parent.focus(this);
		}
	};

	return Tab;
});


module.directive('jqueryuiTab', [
'$optng.jqueryui.Tab',
function (Tab) {

	return {
		priority: -1,
		require: '^jqueryuiTabs',
		link: function (scope, elt, attrs, $tabs) {
			var $tab = new Tab();

			attrs.$observe('jqueryuiTabTitle', function (value) {
				$tab.title = value;
			});

			$tab.template = attrs.jqueryuiTab;
			$tabs.addTab($tab);
		}
	}

}]);

})();