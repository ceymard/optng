(function () {

var module = angular.module('optng.jqueryui.fieldset', ['ng']);

module.directive('fieldset', function () {
	return {
		restrict: 'E',
		link: function (scope, elt, attrs) {
			var legend = angular.element('<legend>');

			attrs.$observe('legend', function (value) {
				if (value) {
					elt.prepend(legend);
					legend.text(value);
				} else {
					legend.detach();
				}
			});
		}
	};
});

})();