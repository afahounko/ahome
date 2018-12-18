/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'PkiList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, $location, Rest, PkiList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = PkiList,
        defaultUrl = GetBasePath('ipam_pkis');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_pkis')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processPkiRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processPkiRow(pki) {
            pki = processRow('ipam_pkis', pki);
	    }
 
 		$scope.showJobScript = function(id)
 		{
 			if(this.pki.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
 				console.log('/jobs/playbook/' + this.pki.last_id);
 				$location.path('/jobs/playbook/' + this.pki.last_id);
 			}
 		}

        $scope.addNew = function(param) {
            console.log("Add Pki infraPki" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraPkiList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.pkis.' + this.pki.related.opts.fk_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'pkis');
        	$window.localStorage.setItem('fk_type', this.pki.related.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.pki.id);

            $rootScope.infraJob = "infraPkiList";

            $state.go('infraJobsList', {job_search:{fk_model:'pkis', fk_type:this.pki.related.opts.fk_type, fk_id:this.pki.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchPki = function(pki_id) {
        	LaunchRelatedJobTemplate(defaultUrl, pki_id, null, 'template_id', 0, '');
        };

        $scope.poweroffPki= function(pki_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, pki_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removePki = function(pki_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, pki_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editPki= function() {
        	console.log("stateGO");
            console.log('infraPkiList.edit_' + this.pki.related.opts.fk_type);
            $window.localStorage.setItem('form_id', this.pki.related.opts.fk_type);
            $state.go('infraPkiList.edit_' + this.pki.related.opts.fk_type, { pki_id: this.pki.id });
        };

        $scope.deletePki = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'pkis',  this.pki.related.opts.fk_type);
        };
    }
];
