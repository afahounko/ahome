/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'Alert', 'JobList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteSubJobTemplate',
    function($window, $scope, $rootScope, $location, Rest, Alert, JobList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteSubJobTemplate) {
    	
        var list = JobList,
        	fk_model = $window.localStorage.getItem('fk_model'),
        	fk_type =  $window.localStorage.getItem('fk_type'),
        	fk_id =  $window.localStorage.getItem('fk_id'),
        	defaultUrl = GetBasePath('ipam_infrastructure_jobs');
        var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {
        	var job, cnt;
			$scope.canAdd = false;
            $rootScope.infraJob = fk_model.toUpperCase() + " - " + fk_type.toUpperCase() + " - " + "INFRA JOB";
            
            rbacUiControlService.canAdd('ipam_infrastructure_jobs')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
	        $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processJobRow);
	        });
			// search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            //$scope.searchTags.push("vm000");
            
            $rootScope.flashMessage = null;
            $scope.selected = [];
			$scope.paramCategory = fk_model + '.' + fk_type
        }
		
		//This function is for Getting Job Template's status
	    function processJobRow(job) {
	    	job = processRow('ipam_infrastructure_jobs', job);
	    }
        $scope.BackTo = function() {
        	var back_addr = 'infra' + fk_model.charAt(0).toUpperCase() + fk_model.substr(1).toLowerCase() + 'List';
        	console.log(back_addr);
        	$state.go(back_addr, {}, {reload: true});
        }
        
        $scope.addNew = function(param) {
            console.log("Add Job " + param);
            $window.localStorage.setItem('form_id', param);
            $scope.paramCategory = fk_model + '.' + fk_type
            $state.go('infraJobsList.add_' + param);
        };
 
 		$scope.showJobScript = function(id)
 		{
 			console.log(this.job.job_status);
 			
 			if(this.job.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
				console.log('/jobs/playbook/' + this.job.last_id);
 				$location.search({});
 				$location.path('/jobs/playbook/' + this.job.last_id);
 			}
 		}
 		
        $scope.launchJob= function(job_id) {
            LaunchRelatedJobTemplate(defaultUrl, job_id, null, 'template_id', 0, '');
        };

        $scope.poweroffJob= function(job_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, job_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeJob= function(job_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, job_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editJob= function() {
        	console.log("stateGO");
            console.log('infraJobsList.edit_' + this.job.related.opts.id_type);
            $window.localStorage.setItem('form_id', this.job.related.opts.id_type);
            $state.go('infraJobsList.edit_' + this.job.related.opts.id_type, { job_id: this.job.id });
        };

        $scope.deleteJob = function(id, name) {
        	console.log($scope);
        	console.log($state.params);
			DeleteSubJobTemplate(defaultUrl, id, name, 1);
        };
    }
];
