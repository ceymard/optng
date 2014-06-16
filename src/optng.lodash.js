(function () {

/**
	@module optng.lodash

	@description
		An adaptation of lodash's methods to the angular filters world.

	@author Christophe Eymard <ceymard@optilian.com>
*/

'use strict';

var module = angular.module('optng.lodash', ['ng']);

var exposed_methods = [
	// Arrays
    'compact', 'difference', 'drop', 'first', 'flatten', 'head', 'indexOf', 'initial',
    'intersection', 'last', 'lastIndexOf', 'object', 'range', 'rest', 'sortedIndex',
    'tail', 'take', 'union', 'uniq', 'unique', 'without', 'zip',

    // Collections
    'all', 'any', 'at', 'collect', 'contains', 'countBy', 'detect', 'each', 'every',
    'filter', 'find', 'foldl', 'foldr', 'forEach', 'groupBy', 'include',
    'inject', 'invoke', 'map', 'max', 'min', 'pluck', 'reduce', 'reduceRight', 'reject',
    'select', 'shuffle', 'size', 'some', 'sortBy', 'toArray', 'where',

    // Objects
    'assign', 'clone', 'cloneDeep', 'defaults', 'extend', 'forIn', 'forOwn', 'functions',
    'has', 'invert', 'isArguments', 'isArray', 'isBoolean', 'isDate', 'isElement', 'isEmpty',
    'isEqual', 'isFinite', 'isFunction', 'isNaN', 'isNull', 'isNumber', 'isObject',
    'isPlainObject', 'isRegExp', 'isString', 'isUndefined', 'keys', 'merge', 'methods',
    'omit', 'pairs', 'pick', 'values',

    // Utilities
    'escape', 'identity', 'mixin', 'random', 'result', 'unescape', 'uniqueId'
];

_.each(exposed_methods, function (name) {
	module.filter(name, function () {
		return function(input) {
			return _[name].apply(_, arguments);
		};
	});
});


// Just an added filter that probably shouldn't be here.
module.filter('default', function () {
    return function (value, def) {
        return value ? value : def;
    };
});

})();