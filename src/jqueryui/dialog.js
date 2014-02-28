(function () {

var module = angular.module('optng.jqueryui.dialog', [
	'ng',
	'optng.jqueryui.dialog.templates',
	'optng.jqueryui.button'
]);

module.run(['$rootScope', '$optng.jqueryui.dialog',
function ($root, $dialog) {
	$root.$dialog = $dialog;
}])

module.directive('jquiDialog',
['$optng.jqueryui.factory',
function ($factory) {

	var options = ['appendTo', 'autoOpen', 'buttons', 'closeOnEscape', 'closeText',
		'dialogClass', 'draggable', 'height', 'hide', 'maxHeight', 'maxWidth',
		'minHeight', 'minWidth', 'modal', 'position', 'resizable', 'show',
		'title', 'width',

		// Events
		'beforeClose', 'close', 'create', 'drag', 'dragStart', 'dragStop',
		'focus', 'open', 'resize', 'resizeStart', 'resizeStop'];


	var methods = ['close', 'destroy', 'isOpen', 'moveToTop', 'open', 'option', 'widget'];

	return {
		templateUrl: '$optng.jqueryui.dialog.template',
		transclude: 'element',
		controller: [
		'$scope', '$element', '$attrs',
		function ($scope, $element, $attrs) {
			var alias = $attrs.jquiDialog || '$dialog';

			$scope.$parent[alias] = this;
			$scope['$dialog'] = this;
			$scope.$dialog.$element = $element;

			// Augment the controller with its methods
			$factory.methods('dialog', this, $element, methods);

			this.open = (function (ctx) {
				angular.forEach(ctx, function (value, key) {
					$scope[key] = value;
				});
				$element.dialog('open');
			}).bind(this);

			var _options = $factory.parse($attrs, options, $scope);
			_options.autoOpen = options.autoOpen || false;

			$element.dialog(_options);
		}]
	};

}]);

})();
