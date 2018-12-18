/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'AppList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, $location, Rest, AppList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = AppList,
        defaultUrl = GetBasePath('ipam_apps');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_apps')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processAppRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processAppRow(app) {
            app = processRow('ipam_apps', app);
	    }
 
 		$scope.showJobScript = function(id)
 		{
 			if(this.app.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
 				console.log('/jobs/playbook/' + this.app.last_id);
 				$location.path('/jobs/playbook/' + this.app.last_id);
 			}
 		}

        $scope.addNew = function(param) {
            console.log("Add App infraApp" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraAppsList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.apps.' + this.app.related.opts.fk_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'apps');
        	$window.localStorage.setItem('fk_type', this.app.related.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.app.id);

            $rootScope.infraJob = "infraAppsList";

            $state.go('infraJobsList', {job_search:{fk_model:'apps', fk_type:this.app.related.opts.fk_type, fk_id:this.app.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchApp = function(app_id) {
        	LaunchRelatedJobTemplate(defaultUrl, app_id, null, 'template_id', 0, '');
        };

        $scope.poweroffApp= function(app_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, app_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeApp = function(app_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, app_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editApp= function() {
        	console.log("stateGO");
            console.log('infraAppsList.edit_' + this.app.related.opts.fk_type);
            $window.localStorage.setItem('form_id', this.app.related.opts.fk_type);
            $state.go('infraAppsList.edit_' + this.app.related.opts.fk_type, { app_id: this.app.id });
        };

        $scope.deleteApp = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'apps',  this.app.related.opts.fk_type);
        };
    }
];
