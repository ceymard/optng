(function () {

var module = angular.module('optng.jqueryui.core', ['ng']);

module.factory('$optng.jqueryui.factory',
['$compile', '$parse',
function ($compile, $parse) {
	var forEach = angular.forEach;

	return {
		methods: function (widget, ctrl, elt, methods) {
			forEach(methods, function (method) {
				ctrl[method] = (function () {
					var args = [method].concat(arguments);
					return elt[widget].apply(elt, args);
				}).bind(ctrl);
			});
		},

		parse: function (attrs, opts, scope) {
			var options = scope.$eval(attrs.jqueryuiOptions || '{}');

			forEach(opts, function (optn) {
				var attr = 'jqueryui' + optn[0].toUpperCase() + optn.slice(1);
				if (attrs[attr])
					options[optn] = scope.$eval(attrs[attr]);
			});

			return options;
		}
	};

}]);

})();