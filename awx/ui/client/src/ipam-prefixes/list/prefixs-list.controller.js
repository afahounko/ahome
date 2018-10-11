/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', 'Rest', 'PrefixList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($scope, $rootScope, Rest, PrefixList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
    Dataset, i18n) {

        var list = PrefixList,
        defaultUrl = GetBasePath('ipam_prefixes');

        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_prefixes')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
                
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;


            $rootScope.flashMessage = null;
            $scope.selected = [];
        }
        
        $scope.addPrefix = function() {
            $state.go('ipamPrefixesList.add');
        };

        $scope.editPrefix = function() {
            $state.go('ipamPrefixesList.edit', { prefix_id: this.prefix.id });
        };

        $scope.deletePrefix = function(id, prefix) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                Wait('start');
                var url = defaultUrl + id + '/';
                Rest.setUrl(url);
                Rest.destroy()
                    .then(() => {

                        let reloadListStateParams = null;

                        if($scope.ipam_prefixes.length === 1 && $state.params.prefix_search && !_.isEmpty($state.params.prefix_search.page) && $state.params.prefix_search.page !== '1') {
                            reloadListStateParams = _.cloneDeep($state.params);
                            reloadListStateParams.prefix_search.page = (parseInt(reloadListStateParams.prefix_search.page)-1).toString();
                        }

                        if (parseInt($state.params.prefix_id) === id) {
                            $state.go('^', null, { reload: true });
                        } else {
                            $state.go('.', null, { reload: true });
                        }
                    })
                    .catch(({data, status}) => {
                        ProcessErrors($scope, data, status, null, {
                            hdr: i18n._('Error!'),
                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE returned status: '), url) + status
                        });
                    });
            };

            Prompt({
                hdr: i18n._('Delete'),
                resourceName: $filter('sanitize')(prefix),
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Prefix?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
