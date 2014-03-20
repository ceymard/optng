(function () {

var module = angular.module('optng.utils.goodparts', []);

module.factory('optng.utils.goodparts', function () {

    var re_super_call = /this.super\s*\(/;

    var methods = {
        inherits: function inherits(Parent) {
            this.prototype = new Parent();
            this.prototype.constructor = this;
            return this;
        },
        methods: function methods(_methods) {
            for (var name in _methods)
                this.method(name, _methods[name]);
            return this;
        },
        uses: function uses() {
            // uses is an alias for methods since it just copies
            // methods to the prototype.
            return this.methods.apply(this, arguments);
        },
        child: function (sub) {
            goodparts(sub);
            sub.inherits(this);
            return sub;
        }
    };

    function goodparts(fn) {
        this.obj = fn;
        this.obj.prototype.constructor = fn;
    }

    return goodparts;
});

})();