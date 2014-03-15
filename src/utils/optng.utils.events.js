(function () {

var module = angular.module('optng.utils.events', []);

module.factory('optng.utils.events.Eventable', function () {

    function Eventable() {
        this._listeners = {};
    }

    Eventable.prototype = {
        constructor: Eventable,
        on: function (name, fn) {
            this._listeners[name] = this._listeners[name] || [];
            this._listeners[name].push(fn);
        },

        off: function (name, fn) {
            if (!this._listeners[name])
                return;

            if (fn) {
                this._listeners[name] = _.filter(this._listeners[name], function (e) { return e !== fn; });
            } else {
                this._listeners[name] = [];
            }
        },

        trigger: function (name) {
            if (!this._listeners[name])
                return;

            var args = Array.prototype.slice.call(arguments, 1);
            var listeners = this._listeners[name];

            for (var i = 0; i < listeners.length; i++) {
                listeners[i].apply(this, args);
            }
        }
    };

    return Eventable;
});

})();