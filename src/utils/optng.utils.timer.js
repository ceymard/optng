(function () {

var module = angular.module('optng.utils.timer', [
	'ng',
	'optng.utils.goodparts',
	'optng.utils.events'
]);

module.factory('optng.utils.timer',
['$rootScope', 'optng.utils.goodparts', 'optng.utils.events.Eventable',
function ($root, goodparts, Eventable) {

	var Timer = goodparts(function Timer(interval) {
		Eventable.call(this); // parent constructor.

		this._interval = interval;
		this._interval_id = null;
	})
	.inherits(Eventable)
	.methods({
		start: function start() {
			if (!this._interval_id) {
				this.trigger('start');
				this.poll();
				this._interval_id = setInterval(angular.bind(this, this.poll), this._interval * 1000);
			}
			return this;
		},

		stop: function stop() {
			if (this._interval_id) {
				clearInterval(this._interval_id);
				this._interval_id = null;
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
			return this._interval_id !== null;
		},

		interval: function interval(intval) {
			if (intval) {
				this._interval = intval;
				if (this._interval_id)
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
