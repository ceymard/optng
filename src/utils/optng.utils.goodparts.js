(function () {

var module = angular.module('optng.utils.goodparts', []);

module.factory('optng.utils.goodparts', function () {

    var re_super_call = /this.super\s*\(/;

    function Goodparts(fn) {
        this.obj = fn;
        this.obj.prototype.constructor = fn;
    }

    Goodparts.prototype = {
        inherits: function inherits(Parent) {
            this.obj.prototype = new Parent();
            this.obj.prototype.constructor = this.obj;
            return this;
        },
        method: function method(name, fn) {
            this.obj.prototype[name] = this.super(fn);
            return this;
        },
        methods: function methods(_methods) {
            for (var name in _methods)
                this.method(name, _methods[name]);
        },
        uses: function uses() {
            // uses is an alias for methods since it just copies
            // methods to the prototype.
            return this.methods.apply(this, arguments);
        }
    };

    return function (obj) {
        return new Goodparts(obj);
    };
});

})();