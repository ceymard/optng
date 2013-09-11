(function () {

var module = angular.module('optng.utils.ObserverGroup', ['ng']);

module.factory('$optng.utils.ObserverGroup',
['$timeout',
function ($timeout) {

	function ObserverGroup(fn) {
		this.vars = [];
		this.setCallback(fn);
	}

	ObserverGroup.prototype.setCallback = function (fn) {
		var vars = this.vars;

		this.fn = _.debounce(function () {
			// We use $timeout to trigger re-evaluation of the
			// rootScope's variables.
			$timeout(function () {
				(fn || angular.noop).apply(this, vars);
			});
		}, 5);
	}

	ObserverGroup.prototype.callback = function () {
		var index = this.vars.length;
		this.vars.push(null);
		return _.bind(function (res) {
			this.vars[index] = res;
			this.fn();
		}, this);
	}

	return ObserverGroup;
}]);

})();
