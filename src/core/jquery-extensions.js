(function () {

var module = angular.module('optng.core.jquery-extensions', []);

module.config(function () {

	_.extend(angular.element.prototype, {
		childScopes: function (scopes) {
			scopes = scopes || [];

			angular.forEach(this.children(), function (child) {
				var scope = $(child).scope();
				var parentscope = $(child).parent().scope();
				if (scope && scope !== parentscope) {
					scopes.push(scope);
				} else {
					$(child).childScopes(scopes);
				}
			});

			return scopes;
		},

		/**

		*/
		destroy: function () {

			angular.forEach(function (node) {
				node = $(node);

				angular.forEach(node.childScopes(), function (scope) {
					scope.$destroy();
				});

				// If the current scope is unique to this element,
				// destroy it.
				// TODO: maybe should also destroy the siblings !
				var current_scope = node.scope();

				if (current_scope !== node.parent().scope())
					current_scope.$destroy();

			});

			return this.remove();
		}
	});

});

})();
