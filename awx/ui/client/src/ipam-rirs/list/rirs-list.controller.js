/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', 'Rest', 'RirList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($scope, $rootScope, Rest, RirList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
    Dataset, i18n) {

        var list = RirList,
        defaultUrl = GetBasePath('ipam_rirs');

        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_rirs')
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
        
        $scope.addRir = function() {
            $state.go('ipamRirsList.add');
        };

        $scope.editRir = function() {
            $state.go('ipamRirsList.edit', { rir_id: this.rir.id });
        };

        $scope.deleteRir = function(id, name) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                Wait('start');
                var url = defaultUrl + id + '/';
                Rest.setUrl(url);
                Rest.destroy()
                    .then(() => {

                        let reloadListStateParams = null;

                        if($scope.ipam_rirs.length === 1 && $state.params.rir_search && !_.isEmpty($state.params.rir_search.page) && $state.params.rir_search.page !== '1') {
                            reloadListStateParams = _.cloneDeep($state.params);
                            reloadListStateParams.rir_search.page = (parseInt(reloadListStateParams.rir_search.page)-1).toString();
                        }

                        if (parseInt($state.params.rir_id) === id) {
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
                resourceName: $filter('sanitize')(name),
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this rir?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
