(function () {

var module = angular.module('optng.utils.poll', ['ng']);

module.factory('$optng.utils.poll.Poller',
['$timeout',
function ($timeout) {

	function Poller() {

		this.request = null;
		this.interval = null;

		this.last = null;
		this.promise = null;

		this.then = null;
		this.fail = null;

	}

	Poller.prototype = {
		start: function start() {
			if (!this.promise)
				this.poll();
			return this;
		},

		stop: function stop() {
			if (this.promise) {
				$timeout.cancel(this.promise);
				this.promise = null;
			}
			return this;
		},

		poll: function poll() {

			var _this = this;

			// It is expected that the requester returns a promise !
			if (this.request)
				this.request();

			// schedule next poll.
			this.promise = $timeout(angular.bind(this, this.poll), this.interval * 1000);
		},

		setInterval: function setInterval(interval) {
			this.interval = interval;
			return this;
		},

		setRequest: function setRequest(request) {
			this.request = request;
			return this;
		}
	};

	return Poller;

}]);

})();
