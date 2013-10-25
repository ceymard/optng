(function () {

var module = angular.module('optng.fontawesome', ['ng']);

module.directive('icon', function () {

	return {
		restrict: 'A',
		compile: function (elt, attrs) {
			var i = angular.element('<i>');
			i.addClass('icon-' + attrs.icon);
			if (elt.text())
				elt.append(' ');
			elt.append(i);
		}
	};

});

module.directive('icon-pre', function () {

	return {
		restrict: 'A',
		compile: function (elt, attrs) {
			var i = angular.element('<i>');
			i.addClass('icon-' + attrs.icon);
			if (elt.text())
				elt.prepend(' ');
			elt.prepend(i);
		}
	};

});

})();
