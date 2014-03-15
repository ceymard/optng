(function () {

var module = angular.module('optng.utils.timer', [
	'ng',
	'optng.utils.goodparts'
]);

module.factory('optng.utils.timer',
['$rootScope', 'optng.utils.goodparts', 'optng.utils.events.Eventable',
function ($root, goodparts, Eventable) {

	var Timer = goodparts(function Timer(interval) {
		Eventable.call(this); // parent constructor.

		this.interval = interval;
		this.interval_id = null;
	})
	.inherits(Eventable)
	.methods({
		start: function start() {
			if (!this.interval_id) {
				this.trigger('start');
				this.interval_id = setInterval(angular.bind(this, this.poll), this.interval);
			}
			return this;
		},

		stop: function stop() {
			if (this.interval_id) {
				clearInterval(this.interval_id);
				this.interval_id = null;
				this.trigger('stop');
			}
			return this;
		},

		reset: function reset() {
			this.stop();
			this.start();
			return this;
		},

		running: function running() {
			return this.interval_id !== null;
		},

		interval: function interval(intval) {
			if (intval) {
				this.interval = intval;
				if (this.interval_id)
					this.reset();
			}
			return this;
		},

		poll: function poll() {
			this.trigger('tick');
		}
	});

	return Timer;

}]);

})();
