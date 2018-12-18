/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'BackupList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, $location, Rest, BackupList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = BackupList,
        defaultUrl = GetBasePath('ipam_backups');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_backups')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processBackupRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processBackupRow(backup) {
            backup = processRow('ipam_backups', backup);
	    }
 
 		$scope.showJobScript = function(id)
 		{
 			if(this.backup.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
 				console.log('/jobs/playbook/' + this.backup.last_id);
 				$location.path('/jobs/playbook/' + this.backup.last_id);
 			}
 		}

        $scope.addNew = function(param) {
            console.log("Add Backup infraBackup" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraBackupsList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.backups.' + this.backup.related.opts.fk_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'backups');
        	$window.localStorage.setItem('fk_type', this.backup.related.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.backup.id);

            $rootScope.infraJob = "infraBackupsList";

            $state.go('infraJobsList', {job_search:{fk_model:'backups', fk_type:this.backup.related.opts.fk_type, fk_id:this.backup.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchBackup = function(backup_id) {
        	LaunchRelatedJobTemplate(defaultUrl, backup_id, null, 'template_id', 0, '');
        };

        $scope.poweroffBackup= function(backup_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, backup_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeBackup = function(backup_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, backup_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editBackup= function() {
        	console.log("stateGO");
            console.log('infraBackupsList.edit_' + this.backup.related.opts.fk_type);
            $window.localStorage.setItem('form_id', this.backup.related.opts.fk_type);
            $state.go('infraBackupsList.edit_' + this.backup.related.opts.fk_type, { backup_id: this.backup.id });
        };

        $scope.deleteBackup = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'backups',  this.backup.related.opts.fk_type);
        };
    }
];
