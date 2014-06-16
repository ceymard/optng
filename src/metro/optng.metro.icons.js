(function () {

var module = angular.module('optng.metro.icons', ['ng']);

function mkdirective(name) {
	function directive() {
		return {
			restrict: 'A',
			compile: function (elt, attrs) {
				var icon = attrs[name];

				if (name === 'i' || name === 'il')
					elt.prepend("<i class='icon-" + icon + "'></i> ");
				else
					elt.append(" <i class='icon-" + icon + "'></i>");
			}
		};
	}

	return directive;
}

module.directive('i', mkdirective('i'));
module.directive('ir', mkdirective('ir'));

})();
