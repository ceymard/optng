(function () {
/*!
	@module optng.throttler

	@description The throttling module, with a promise creator
		throttler, as well as a drop-in wrapper of the $http service
		to do throttled requests.
*/
var module = angular.module('optng.utils.throttler', ['ng']);

module.value('OPTNG_THROTTLER_DEFAULT_CONCURRENCY', 3);

/*!
	@service $optng.throttler

	@usage throttler(fn, concurrency)

	@description A function wrapping a function that returns promises
		so that it won't execute itself if /concurrency/ instances
		are already waiting to resolve their promises.

		If other promise generators need to be tied to the same throttler,
		they can be called using $wrap() from the given throttler.

	@example lang=javascript
		var http = throttler($http, 3);
		http.get = http.$wrap($http.get);
		// and then just use it like before

	@todo
		For now, we just get then() and catch() methods on the
		promises, but no http specific ones.
		Maybe a custom promise object with support for arbitrary
		methods should be written.
*/
module.factory('optng.utils.throttler',
['$q', 'OPTNG_THROTTLER_DEFAULT_CONCURRENCY',
function ($q, default_concurrency) {

	function throttler(fn, concurrency) {
		var currently_processing = 0,
			queue = [],
			Throttler = null;
		concurrency = _.isUndefined(concurrency) ? default_concurrency : concurrency;

		// Lance la création de la promesse suivante si on est pas déjà
		// en train d'en exécuter autant que la concurrency.
		function _tryCallNext() {
			var queueitem, deferred, args, thiscontext, func;

			// Si le nombre de requêtes actuelles est inférieur à la concurrence
			// max
			if (currently_processing < concurrency || concurrency === 0) {
				// On récupère la requête à exécuter, si il y en a une.
				queueitem = queue.shift();
				if (queueitem) {
					thiscontext = queueitem[0];
					func = queueitem[1];
					deferred = queueitem[2];
					args = queueitem[3];
					currently_processing += 1;

					// Ici, on exécute la fonction originale, (par exemple $http)
					// pour effectuer la requête.
					func.apply(thiscontext, args).then(
						function (result) {
							// on résoud la promesse, et on essaie de lancer la requête
							// suivante avec _done() vu que celle-ci est terminée.
							deferred.resolve(result);
							_done();
							return result;
						},
						function (reason) {
							// idem, mais en cas d'erreur.
							deferred.reject(reason);
							_done();
							return reason;
						}
					);
				}
			}
		}

		// Exécuté au retour d'une promesse précédemment lancée, cette fonction
		// signale que l'on a une promesse de moins en train de s'exécuter,
		// et essaie de lancer la suivante que l'on a en queue.
		function _done() {
			currently_processing -= 1;
			_tryCallNext();
		}

		function _wrap(fn) {
			function wrapped() {
				var deferred = $q.defer();
				queue.push([this, fn, deferred, arguments]);
				_tryCallNext();
				return deferred.promise;
			}

			return wrapped;
		}

		Throttler = _wrap(fn);

		Throttler.$wrap = function (fn) {
			return _wrap(fn);
		};

		Throttler.$setConcurrency = function (value) {
			concurrency = value;
			// Since we changed the concurrency value, we may have a new
			// spot open to launch a new request.
			_tryCallNext();
		};
		return Throttler;
	}

	return throttler;
}]);

/*!
	@service $optng.throttler.http

	@description
		A replacement for the $http service that is throttled by default.
		Use it just like $http, except that you can use setConcurrency
		and $wrap.
*/
module.factory('optng.utils.throttler.http',
['$http', 'optng.utils.throttler', 'OPTNG_THROTTLER_DEFAULT_CONCURRENCY',
function ($http, throttler, default_concurrency) {
	var http = throttler($http, default_concurrency);

	_.each(['get', 'head', 'post', 'put', 'delete', 'jsonp'], function (method) {
		var wrapped = http.$wrap($http[method]);

		http[method] = function () {
			return wrapped.apply($http, arguments);
		};
	});

	return http;
}]);

})();
