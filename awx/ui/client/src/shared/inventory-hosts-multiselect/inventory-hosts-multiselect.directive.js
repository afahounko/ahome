import MultiselectController from './inventory-hosts-multiselect.controller';
export default ['templateUrl', '$compile',
    function(templateUrl, $compile) {
        return {
            scope: {
                inventory_hosts: '=?bind',
                fieldIsDisabled: '='
            },
            restrict: 'E',
            templateUrl: templateUrl('shared/inventory-hosts-multiselect/inventory-hosts-multiselect'),
            controller: MultiselectController,
            link: function(scope) {
            	console.log('Multi link function');
                scope.openMultiselectModal = function() {
                    $('#content-container').append($compile('<inventory-hosts-modal bind="inventory_hosts"></inventory-hosts-modal>')(scope));
                };
            }
        };
    }
];
