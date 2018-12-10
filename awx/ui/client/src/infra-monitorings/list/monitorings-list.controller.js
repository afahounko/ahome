/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', 'Rest', 'MonitoringList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($window, $scope, $rootScope, Rest, MonitoringList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
    Dataset, i18n) {

        var list = MonitoringList,
        defaultUrl = GetBasePath('ipam_monitorings');

        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_monitorings')
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

        $scope.addNew = function(param) {
            $window.localStorage.setItem('form_id', param);
            $state.go('infraMonitoringsList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.monitorings.' + this.monitoring.related.opts.id_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'monitorings');
        	$window.localStorage.setItem('fk_type', this.monitoring.related.opts.id_type);
        	$window.localStorage.setItem('fk_id', this.monitoring.id);
            $state.go('infraJobsList');
			console.log("State Go finished");
        };
        
        $scope.launchMonitoring= function() {
        	console.log("Launch");
            //$rootScope.form_id = this.monitoring.related.opts.id_type;
            //$state.go('infraJobsList', null, { reload: true});
        };

        $scope.editMonitoring= function() {
        	console.log("stateGO");
            console.log('infraMonitoringsList.edit_' + this.monitoring.related.opts.id_type);
            $window.localStorage.setItem('form_id', this.monitoring.related.opts.id_type);
            $state.go('infraMonitoringsList.edit_' + this.monitoring.related.opts.id_type, { monitoring_id: this.monitoring.id });
        };

        $scope.deleteMonitoring = function(id, name) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                Wait('start');
                var url = defaultUrl + id + '/';
                Rest.setUrl(url);
                Rest.destroy()
                    .then(() => {
                        let reloadListStateParams = null;

                        if($scope.ipam_monitorings.length === 1 && $state.params.monitoring_search && !_.isEmpty($state.params.monitoring_search.page) && $state.params.monitoring_search.page !== '1') {
                            reloadListStateParams = _.cloneDeep($state.params);
                            reloadListStateParams.monitoring_search.page = (parseInt(reloadListStateParams.monitoring_search.page)-1).toString();
                        }

                        if (parseInt($state.params.monitoring_id) === id) {
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
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Monitoring?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
