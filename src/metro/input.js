(function () {

var module = angular.module('metro.inputs', ['ng']);

module.directive(
'metroInput',
function () {

	return {
		restrict: 'A',
		compile: function (elt, attrs) {
			var div = angular.element('<div class="input-control"></div>');
			elt.wrap(div);

			var label = angular.element("<label>");

			div.after(label);
			label.after(div);

			var type = (elt.attr('type') || "").toLowerCase();

			if (elt[0].nodeName === 'TEXTAREA') {
				div.addClass('textarea');
				label.text(attrs.label);
			} else if (type === 'text') {
				div.addClass('text');
				label.text(attrs.label);

				var button = angular.element('<button class="btn-clear">');
				button.attr('tabindex', '-1');
				div.append(button);
			} else if (type === "checkbox" || type === "radio") {
				div.addClass(type);
				div.append(label);
				label.append(elt);

				if (attrs.labelLeft)
					label.append(attrs.labelLeft + "&nbsp;");

				label.append(angular.element("<span class='check'>"));

				if (attrs.label)
					label.append(attrs.label);
			}

		}
	};

});

})();