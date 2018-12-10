/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'ProviderList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, $location, Rest, ProviderList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = ProviderList,
        defaultUrl = GetBasePath('ipam_providers');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_providers')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processProviderRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processProviderRow(provider) {
            provider = processRow('ipam_providers', provider);
	    }
 
 		$scope.showJobScript = function(id)
 		{
 			if(this.provider.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
 				console.log('/jobs/playbook/' + this.provider.last_id);
 				$location.path('/jobs/playbook/' + this.provider.last_id);
 			}
 		}

        $scope.addNew = function(param) {
            console.log("Add Provider infraProvider" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraProvidersList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.providers.' + this.provider.related.opts.fk_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'providers');
        	$window.localStorage.setItem('fk_type', this.provider.related.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.provider.id);

            $rootScope.infraJob = "infraProvidersList";

            $state.go('infraJobsList', {job_search:{fk_model:'providers', fk_type:this.provider.related.opts.fk_type, fk_id:this.provider.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchProvider = function(provider_id) {
        	LaunchRelatedJobTemplate(defaultUrl, provider_id, null, 'template_id', 0, '');
        };

        $scope.poweroffProvider= function(provider_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, provider_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeProvider = function(provider_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, provider_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editProvider= function() {
        	console.log("stateGO");
            console.log('infraProvidersList.edit_' + this.provider.related.opts.fk_type);
            $window.localStorage.setItem('form_id', this.provider.related.opts.fk_type);
            $state.go('infraProvidersList.edit_' + this.provider.related.opts.fk_type, { provider_id: this.provider.id });
        };

        $scope.deleteProvider = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'providers',  this.provider.related.opts.fk_type);
        };
    }
];
