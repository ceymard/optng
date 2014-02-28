(function () {

var module = angular.module('optng.jqueryui.button', [
	'ng',
	'optng.jqueryui.core'
]);

module.directive('jquiButton',
function () {

	return {
		restrict: 'A',
		link: function ($scope, elt, attrs) {
			var contents = elt.contents();
			var opts = $scope.$eval(attrs.jquiButton || '{}');

			var span = angular.element('<span>');
			span.append(contents);

			elt.addClass('ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only');

			if (opts.type)
				elt.addClass('btn-' + opts.type);

			if (opts.icons && opts.icons.primary) {
				var primary = angular.element('<span class="ui-icon ui-button-icon-primary"></span>');
				primary.addClass(opts.icons.primary);
				elt.append(primary);
			}

			elt.append(span);

			if (opts.icons && opts.icons.secondary) {
				var secondary = angular.element('<span class="ui-icon ui-button-icon-secondary"></span>');
				secondary.addClass(opts.icons.secondary);
				elt.append(secondary);
			}
		}
	}

});
