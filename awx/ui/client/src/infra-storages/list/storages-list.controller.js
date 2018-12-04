/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', 'Rest', 'StorageList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, Rest, StorageList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = StorageList,
        defaultUrl = GetBasePath('ipam_storages');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_storages')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processStorageRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processStorageRow(storage) {
            storage = processRow('ipam_storages', storage);
	    }

        $scope.addNew = function(param) {
            console.log("Add Storage infraStorage" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraStoragesList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.storages.' + this.storage.related.opts.fk_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'storages');
        	$window.localStorage.setItem('fk_type', this.storage.related.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.storage.id);

            $rootScope.infraJob = "infraStoragesList";

            $state.go('infraJobsList', {job_search:{fk_model:'storages', fk_type:this.storage.related.opts.fk_type, fk_id:this.storage.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchStorage = function(storage_id) {
        	LaunchRelatedJobTemplate(defaultUrl, storage_id, null, 'template_id', 0, '');
        };

        $scope.poweroffStorage= function(storage_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, storage_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeStorage = function(storage_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, storage_id, name, 'remove_id', 1, 'Remove');
        };
        
        $scope.editStorage= function() {
        	console.log("stateGO");
            console.log('infraStoragesList.edit_' + this.storage.related.opts.fk_type);
            $window.localStorage.setItem('form_id', this.storage.related.opts.fk_type);
            $state.go('infraStoragesList.edit_' + this.storage.related.opts.fk_type, { storage_id: this.storage.id });
        };

        $scope.deleteStorage = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'storages',  this.storage.related.opts.fk_type);
        };
    }
];
