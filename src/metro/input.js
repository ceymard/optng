(function () {

var module = angular.module('metro.inputs', ['ng']);

module.directive(
'metroInput',
function () {

	return {
		restrict: 'A',
		link: function (scope, elt, attrs) {
			var div = angular.element('<div class="input-control"></div>');
			elt.wrap(div);

			var classes = ['size1', 'size2', 'size3', 'size4', 'size5', 'size6',
										 'size7', 'size8', 'size9', 'size10', 'size11', 'size12'];

			angular.forEach(classes, function (cls) {
				if (elt.hasClass(cls))
					div.addClass(cls);
			});

			var label = angular.element("<label>");

			div.after(label);
			label.after(div);

			var type = (elt.attr('type') || "").toLowerCase();

			if (elt[0].nodeName === 'TEXTAREA') {

				div.addClass('textarea');
				label.text(attrs.label);

				if (!attrs.label)
					label.remove();

			} else if (elt[0].nodeName === 'SELECT') {

				div.addClass('select');
				label.text(attrs.label);

				if (!attrs.label)
					label.remove();

			} else if (type === 'text') {
				div.addClass('text');
				label.text(attrs.label);

				if (!attrs.label)
					label.remove();

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