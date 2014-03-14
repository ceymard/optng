(function () {

var module = angular.module('optng.jqueryui.core', ['ng']);

module.directive(
'jquiHoverable',
function () {

	return {
		link: function (scope, elt, attrs) {

			function add() { elt.addClass('ui-state-hover'); }
			function del() { elt.removeClass('ui-state-hover'); }

			elt.on('mouseenter', add);
			elt.on('mouseleave', del);

			scope.$on('$destroy', function () {
				elt.off('mouseenter', add);
				elt.off('mouseleave', del);
			});
		}
	};

});

})();
