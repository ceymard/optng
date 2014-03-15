(function () {

var module = angular.module('optng.utils.watcher', [
	'ng',
	'optng.utils.events'
]);

module.factory('optng.utils.watcher',
['$timeout', 'optng.utils.events.Eventable', 'optng.utils.goodparts',
function ($timeout, Eventable, goodparts) {

	var Watcher = goodparts(function Watcher() {
		Eventable.call(this);
		this.change_pending = false;
		this.vars = [];
		this.obj_vars = {};
	})
	.inherits(Eventable)
	.methods({
		callback: function callback(name) {
			var self = this;
			if (name) {
				return function (res) {
					self.obj_vars[name] = res;
					self.scheduleChangeEvent();
				};
			} else {
				return function (res) {
					self.vars[index] = res;
					self.scheduleChangeEvent();
				};
			}
		},
		scheduleChangeEvent: function scheduleChangeEvent() {
			if (!this.change_pending) {
				var self = this;
				this.change_pending = true;

				$timeout(function () {
					self.changed();
				});
			}
		},
		changed: function changed() {
			this.change_pending = false;

			var args = ['changed'];
			args = args.concat(this.vars);
			args.push(obj_vars);

			this.trigger.apply(this, args);
		}
	});

	return Watcher;
}]);

})();
