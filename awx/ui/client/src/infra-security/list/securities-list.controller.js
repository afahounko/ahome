/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'SecurityList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, $location, Rest, SecurityList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = SecurityList,
        defaultUrl = GetBasePath('ipam_securities');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_securities')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processSecurityRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processSecurityRow(security) {
            security = processRow('ipam_securities', security);
	    }
 
 		$scope.showJobScript = function(id)
 		{
 			if(this.security.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
 				console.log('/jobs/playbook/' + this.security.last_id);
 				$location.path('/jobs/playbook/' + this.security.last_id);
 			}
 		}

        $scope.addNew = function(param) {
            console.log("Add Security infraSecurity" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraSecurityList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.securities.' + this.security.related.opts.fk_type;
        	//console.log(locationTo);
        	console.log(this.security);
        	$window.localStorage.setItem('fk_model', 'securities');
        	$window.localStorage.setItem('fk_type', this.security.related.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.security.id);

            $rootScope.infraJob = "infraSecurityList";

            $state.go('infraJobsList', {job_search:{fk_model:'securities', fk_type:this.security.related.opts.fk_type, fk_id:this.security.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchSecurity = function(security_id) {
        	LaunchRelatedJobTemplate(defaultUrl, security_id, null, 'template_id', 0, '');
        };

        $scope.poweroffSecurity= function(security_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, security_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeSecurity = function(security_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, security_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editSecurity= function() {
        	console.log("stateGO");
            console.log('infraSecurityList.edit_' + this.security.related.opts.fk_type);
            $window.localStorage.setItem('form_id', this.security.related.opts.fk_type);
            $state.go('infraSecurityList.edit_' + this.security.related.opts.fk_type, { security_id: this.security.id });
        };

        $scope.deleteSecurity = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'securities',  this.security.related.opts.fk_type);
        };
    }
];
