/**
	@module optng.gestures

	@description A module to handle user input on elements and the whole
		document.

		TODO: a better description.
*/
(function () {

// The module declaration.
var module = angular.module('optng.gestures.service', []);

var keys = {
	backspace: 8,
	tab: 9,
	enter: 13,
	shift: 16,
	ctrl: 17,
	alt: 18,
	pause: 19,
	capslock: 20,
	escape: 27,
	pageup: 33,
	pagedown: 34,
	end: 35,
	home: 36,
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	insert: 45,
	'delete': 46,
	'0': 48,
	'1': 49,
	'2': 50,
	'3': 51,
	'4': 52,
	'5': 53,
	'6': 54,
	'7': 55,
	'8': 56,
	'9': 57,
	a: 65,
	b: 66,
	c: 67,
	d: 68,
	e: 69,
	f: 70,
	g: 71,
	h: 72,
	i: 73,
	j: 74,
	k: 75,
	l: 76,
	m: 77,
	n: 78,
	o: 79,
	p: 80,
	q: 81,
	r: 82,
	s: 83,
	t: 84,
	u: 85,
	v: 86,
	w: 87,
	x: 88,
	y: 89,
	z: 90,
	leftwin: 91,
	rightwin: 92,
	select: 93,
	numpad0: 96,
	numpad1: 97,
	numpad2: 98,
	numpad3: 99,
	numpad4: 100,
	numpad5: 101,
	numpad6: 102,
	numpad7: 103,
	numpad8: 104,
	numpad9: 105,
	multiply: 106,
	add: 107,
	subtract: 109,
	decimalpoint: 110,
	divide: 111,
	f1: 112,
	f2: 113,
	f3: 114,
	f4: 115,
	f5: 116,
	f6: 117,
	f7: 118,
	f8: 119,
	f9: 120,
	f10: 121,
	f11: 122,
	f12: 123,
	numlock: 144,
	scrolllock: 145,
	semicolon: 186,
	equal: 187,
	comma: 188,
	dash: 189,
	period: 190,
	slash: 191,
	grave: 192,
	openbracket: 219,
	backslash: 220,
	closebracket: 221,
	singlequote: 222,

	// Mouse events

	click: 'click', // 0 is left mouse button
	dblclick: 'dblclick'
};

module.factory('optng.gestures.GestureHandler', function () {
	/**
	 * Transform an expression such as "Alt+Shift+3" to a modifiers object.
	 */
	function makeKeyChecker(expression) {
		var split_keys = _.map(expression.toLowerCase().trim().split(/[\+\-]/), function (name) { return name.trim(); });
		var key_name = split_keys[split_keys.length - 1].toLowerCase();
		var key_int = keys[key_name];
		var modifiers = {
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false
		};

		_.each(split_keys.slice(0, split_keys.length - 1), function (name) {
			modifiers[name + 'Key'] = true;
		});

		if (_.isNumber(key_int)) {
			// Keys return numbers, unlike special events like mouse events.
			return function (event) {
				return event.keyCode === key_int && _.all([event], modifiers);
			};
		}

		return function (event) {
			return event.type === key_int && _.all([event], modifiers);
		};
	}

	/**
	 *
	 */
	function makeChainChecker(expression) {
		var split = expression.split(/\s*,\s*/);
		return _.map(split, function (exp) {
			return {
				expression: exp,
				check: makeKeyChecker(exp),
				action: null,
				subchains: []
			};
		});
	}

	function GestureHandler() {
		this.root_chain = [];
		this.reset();
	}

	/**
		@method clearGestures()

		@description
	*/
	GestureHandler.prototype.clearGestures = function () {
		this.root_chain = [];
	};

	/**
		@method addGesture(gesture, action)

		@param gesture (String) The gesture in "Alt+Shift+n" form.

		@param action (Function) The function that will be called if
			the gesture was triggered.
	*/
	GestureHandler.prototype.addGesture = function (gesture, action) {
		var chain = makeChainChecker(gesture);
		var root = this.root_chain;
		chain[chain.length - 1].action = action;

		function appendToChain(root, chain) {
			var first = _.find(root, function (elt) {
				return elt.expression === chain[0].expression;
			});

			if (first) {
				if (chain.length > 1) {
					appendToChain(first.subchains, chain.slice(1));
				} else {
					// Replace the action if we redefine a shortcut.
					first.action = action;
					console.warn('Already registered a shortcut for ' + gesture + ', redefining binding.');
				}
			} else {
				root.push(chain[0]);

				// This gesture doesn't exist at this point in the chain
				if (chain.length > 1) {
					appendToChain(chain[0].subchains, chain.slice(1));
				}
			}
		}

		appendToChain(this.root_chain, chain);
	};

	/**

	*/
	GestureHandler.prototype.addMultipleGestures = function (defs) {
		_.each(defs, function (action, gesture) {
			this.addGesture(gesture, action);
		}, this);
	};

	/**

	*/
	GestureHandler.prototype.removeMultipleGestures = function (gestures) {

		if (!_.isArray(gestures))
			// if gestures is a plain object, like a definition one,
			// we construct the array of gestures to remove.
			gestures = _.map(gestures, function (action, gesture) { return gesture; });

		_.each(gestures, function (gesture) {
			this.removeGesture(gesture);
		}, this);
	};

	/**
		@method removeGesture(gesture)

		@description Remove a gesture from the chain.
	*/
	GestureHandler.prototype.removeGesture = function (gesture) {
		var chain = makeChainChecker(gesture);

		function removeFromChain(root, chain) {
			var index = _.findIndex(root, function (elt) {
				return elt.expression === chain[0].expression;
			});

			if (index === -1)
				// Shortcut not found !
				return; // Log an error ?

			if (chain.length > 1) {
				if (root[index].subchains.length === 0)
					// Shortcut continues, but there is already no subchains.
					return;

				removeFromChain(root[index].subchains, chain.slice(1));

			} else {
				if (root[index].subchains.length > 0)
					// Want to destroy a shortcut that has actually subchains
					return; // Log an error ?

				// Otherwise, all is good, we just splice it/remove the shortcut
				root.splice(index, 1);
			}
		}

		removeFromChain(this.root_chain, chain);
	};

	/**
	 *
	 */
	GestureHandler.prototype.check = function (event) {
		var match = _.find(this.state, function (c) {
			return c.check(event);
		});

		if (!match) {
			this.reset();
			return false; // we didn't find a matching event in this chain.
		}

		if (match && match.subchains.length > 0) {
			this.state = match.subchains;
			return true; // we found a match but it is part of a gesture.
		}

		this.reset();
		match.action({$event: event});
		return true;
	};

	/**
	 *
	 */
	GestureHandler.prototype.reset = function () {
		this.state = this.root_chain;
	};

	return GestureHandler;

});

/**
	@service $optng.gestures

	@description The gesture service to register gestures.
 */
module.factory('optng.gestures',
['optng.gestures.GestureHandler', '$parse', '$rootScope',
function (GestureHandler, $parse, $rootScope) {

	function _make_handler(handler) {
		return function handle(event) {
			if (handler.check(event)) {
				event.stopPropagation();
				event.preventDefault();
				return false;
			}
		};
	}

	var global_handler = new GestureHandler();
	var global_handle_fn = _make_handler(global_handler);

	angular.element(document).on('keydown', global_handle_fn);
	angular.element(document).on('click', global_handle_fn);

	// return global_gestures;

	return function (gestures, scope, elt) {
		var handler = global_handler;
		var handle_fn = global_handle_fn;

		if (elt || elt && elt.length > 0) {
			handler = new GestureHandler();
			handle_fn = _make_handler(handler);

			elt.on('keydown', handle_fn);
			elt.on('click', handle_fn);
		}

		scope = scope || $rootScope;

		if (angular.isString(gestures))
			gestures = scope.$eval(gestures);

		angular.forEach(gestures, function (action, gesture) {

			// If the action is not a function, we parse the action
			// to compile it into one.
			if (!angular.isFunction(action)) {
				var expression = $parse(action);
				action = function (locals) {
					expression(scope, locals);
					scope.$apply();
				};
			}

			// We can now add the gesture to the handler
			handler.addGesture(gesture, action);
		});

		// When the scope dies, we remove the gestures that we
		// added previously.
		scope.$on('$destroy', function () {
			handler.removeMultipleGestures(gestures);

			if (elt) {
				elt.off('keydown', handle_fn);
				elt.off('click', handle_fn);
			}
		});
	};
}]);

})();
