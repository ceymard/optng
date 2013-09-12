(function () {

var module = angular.module('optng.core.jquery-extensions', []);

module.run(function () {

	/**

	*/
	$.fn.childScopes = function (scopes) {
		scopes = scopes || [];

		_.each(this.children(), function (child) {
			var scope = $(child).scope();
			var parentscope = $(child).parent().scope();
			if (scope && scope !== parentscope) {
				scopes.push(scope);
			} else {
				$(child).childScopes(scopes);
			}
		});

		return scopes;
	};

	/**

	*/
	$.fn.destroy = function () {

		this.each(function (i, node) {
			node = $(node);

			$.each(node.childScopes(), function (i, scope) {
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

})();
