/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', 'Rest', 'AggregateList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($scope, $rootScope, Rest, AggregateList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
    Dataset, i18n) {

        var list = AggregateList,
        defaultUrl = GetBasePath('ipam_aggregates');

        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_aggregates')
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
        
        $scope.addAggregate = function() {
            $state.go('ipamAggregatesList.add');
        };

        $scope.editAggregate = function() {
            $state.go('ipamAggregatesList.edit', { aggregate_id: this.aggregate.id });
        };

        $scope.deleteAggregate = function(id, prefix) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                Wait('start');
                var url = defaultUrl + id + '/';
                Rest.setUrl(url);
                Rest.destroy()
                    .then(() => {

                        let reloadListStateParams = null;

                        if($scope.ipam_aggregates.length === 1 && $state.params.aggregate_search && !_.isEmpty($state.params.aggregate_search.page) && $state.params.aggregate_search.page !== '1') {
                            reloadListStateParams = _.cloneDeep($state.params);
                            reloadListStateParams.aggregate_search.page = (parseInt(reloadListStateParams.aggregate_search.page)-1).toString();
                        }

                        if (parseInt($state.params.aggregate_id) === id) {
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
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Aggregate?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
