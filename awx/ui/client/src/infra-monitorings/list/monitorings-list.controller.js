/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'MonitoringList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, $location, Rest, MonitoringList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = MonitoringList,
        defaultUrl = GetBasePath('ipam_monitorings');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_monitorings')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processMonitoringRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processMonitoringRow(monitoring) {
            monitoring = processRow('ipam_monitorings', monitoring);
	    }
 
 		$scope.showJobScript = function(id)
 		{
 			if(this.monitoring.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
 				console.log('/jobs/playbook/' + this.monitoring.last_id);
 				$location.path('/jobs/playbook/' + this.monitoring.last_id);
 			}
 		}

        $scope.addNew = function(param) {
            console.log("Add Monitoring infraMonitoring" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraMonitoringsList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.monitorings.' + this.monitoring.related.opts.fk_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'monitorings');
        	$window.localStorage.setItem('fk_type', this.monitoring.related.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.monitoring.id);

            $rootScope.infraJob = "infraMonitoringsList";

            $state.go('infraJobsList', {job_search:{fk_model:'monitorings', fk_type:this.monitoring.related.opts.fk_type, fk_id:this.monitoring.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchMonitoring = function(monitoring_id) {
        	LaunchRelatedJobTemplate(defaultUrl, monitoring_id, null, 'template_id', 0, '');
        };

        $scope.poweroffMonitoring= function(monitoring_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, monitoring_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeMonitoring = function(monitoring_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, monitoring_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editMonitoring= function() {
        	console.log("stateGO");
            console.log('infraMonitoringsList.edit_' + this.monitoring.related.opts.fk_type);
            $window.localStorage.setItem('form_id', this.monitoring.related.opts.fk_type);
            $state.go('infraMonitoringsList.edit_' + this.monitoring.related.opts.fk_type, { monitoring_id: this.monitoring.id });
        };

        $scope.deleteMonitoring = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'monitorings',  this.monitoring.related.opts.fk_type);
        };
    }
];
