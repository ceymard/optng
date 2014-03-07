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

module.directive('jquiTabs', function () {

	return {
		templateUrl: '$optng.jqueryui.tab.template',
		controller: [
			'$scope',
			function ($scope) {

			}
		]
	};

});


module.directive('jquiTab', function () {

	return {
		require: '^jquiTabs',
		link: function (scope, elt, attrs, ctrl) {

		}
	};

});

})();