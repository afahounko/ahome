/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'DocumentationList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, $location, Rest, DocumentationList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = DocumentationList,
        defaultUrl = GetBasePath('ipam_documentations');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_documentations')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processDocumentationRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processDocumentationRow(documentation) {
            documentation = processRow('ipam_documentations', documentation);
	    }
 
 		$scope.showJobScript = function(id)
 		{
 			if(this.documentation.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
 				console.log('/jobs/playbook/' + this.documentation.last_id);
 				$location.path('/jobs/playbook/' + this.documentation.last_id);
 			}
 		}

        $scope.addNew = function(param) {
            console.log("Add Documentation infraDocumentation" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraDocumentationsList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.documentations.' + this.documentation.related.opts.fk_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'documentations');
        	$window.localStorage.setItem('fk_type', this.documentation.related.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.documentation.id);

            $rootScope.infraJob = "infraDocumentationsList";

            $state.go('infraJobsList', {job_search:{fk_model:'documentations', fk_type:this.documentation.related.opts.fk_type, fk_id:this.documentation.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchDocumentation = function(documentation_id) {
        	LaunchRelatedJobTemplate(defaultUrl, documentation_id, null, 'template_id', 0, '');
        };

        $scope.poweroffDocumentation= function(documentation_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, documentation_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeDocumentation = function(documentation_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, documentation_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editDocumentation= function() {
        	console.log("stateGO");
            console.log('infraDocumentationsList.edit_' + this.documentation.related.opts.fk_type);
            $window.localStorage.setItem('form_id', this.documentation.related.opts.fk_type);
            $state.go('infraDocumentationsList.edit_' + this.documentation.related.opts.fk_type, { documentation_id: this.documentation.id });
        };

        $scope.deleteDocumentation = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'documentations',  this.documentation.related.opts.fk_type);
        };
    }
];
