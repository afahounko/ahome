/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'ServiceList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, $location, Rest, ServiceList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = ServiceList,
        defaultUrl = GetBasePath('ipam_services');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_services')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processServiceRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processServiceRow(service) {
            console.log(service);
            service = processRow('ipam_services', service);
            console.log(service);
	    }
 
 		$scope.showJobScript = function(id)
 		{
 			if(this.service.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
 				console.log('/jobs/playbook/' + this.service.last_id);
 				$location.path('/jobs/playbook/' + this.service.last_id);
 			}
 		}

        $scope.addNew = function(param) {
            console.log("Add Service infraService" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraServicesList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.services.' + this.service.opts.fk_type;
        	//console.log(locationTo);
        	console.log(this.service);
        	$window.localStorage.setItem('fk_model', 'services');
        	$window.localStorage.setItem('fk_type', this.service.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.service.id);

            $rootScope.infraJob = "infraServicesList";

            $state.go('infraJobsList', {job_search:{fk_model:'services', fk_type:this.service.opts.fk_type, fk_id:this.service.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchService = function(service_id) {
        	LaunchRelatedJobTemplate(defaultUrl, service_id, null, 'template_id', 0, '');
        };

        $scope.poweroffService= function(service_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, service_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeService = function(service_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, service_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editService= function() {
        	console.log("stateGO");
            console.log('infraServicesList.edit_' + this.service.opts.fk_type);
            $window.localStorage.setItem('form_id', this.service.opts.fk_type);
            $state.go('infraServicesList.edit_' + this.service.opts.fk_type, { service_id: this.service.id });
        };

        $scope.deleteService = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'services',  this.service.opts.fk_type);
        };
    }
];
