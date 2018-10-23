import MultiselectController from './multiselect-template.controller';
export default ['templateUrl', '$compile',
    function(templateUrl, $compile) {
        return {
            scope: {
                selectedVars: '=',
                fieldIsDisabled: '='
            },
            restrict: 'E',
            templateUrl: templateUrl('shared/multiselect-template/multiselect-template'),
            controller: MultiselectController,
            link: function(scope) {
                scope.openMultiselectModal = function() {
                    $('#content-container').append($compile('<multiselect-template-modal multiselect-template="selectedVars"></multiselect-template-modal>')(scope));
                };
            }
        };
    }
];
