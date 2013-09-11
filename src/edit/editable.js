
/**
    @directive opt-editable

    @description A companion to ng-model, turns any element to
        an html5 editable component that stores its contents into
        the given ng-model variable.
*/
angular.module('optng.edit.editable', ['ng']).directive('optEditable', function () {

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attr, ngModel) {
                // The contenteditable attribute must be set on the element
                // for it to actually be editable by the browser.
                element.attr('contenteditable', 'true');

                // If used in conjunction with ng-model, register some logic
                // to update the value of the model.
                if (ngModel) {
                        function read () {
                                return ngModel.$setViewValue(element.html());
                        };

                        ngModel.$render = function() {
                                return element.html(ngModel.$viewValue || '');
                        };

                        element.on('blur keyup change', read);

                        // Do not listen to these events anymore.
                        scope.$on('$destroy', function () {
                                element.off('blur keyup change', read);
                        });
                }
        }
    };

});
