/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$location', 'Rest', 'NetworkList', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 'processRow', 'LaunchRelatedJobTemplate', 'DeleteInfrastructure',
    function($window, $scope, $rootScope, $location, Rest, NetworkList, Prompt, JobTemplateModel, WorkflowJobTemplateModel,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
	Dataset, i18n, processRow, LaunchRelatedJobTemplate, DeleteInfrastructure) {

        var list = NetworkList,
        defaultUrl = GetBasePath('ipam_networks');
		var project_id, template_id, poweroff_id, remove_id;
        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_networks')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processNetworkRow);
	        });
	        
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
        }

		//This function is for Getting Job Template's status
	    function processNetworkRow(network) {
            network = processRow('ipam_networks', network);
	    }
 
 		$scope.showJobScript = function(id)
 		{
 			if(this.network.job_status == 'pending'){
 				Alert(i18n._('Job Pending'), i18n._('The selected job is under pending status.'), 'alert-info');
 			}
 			else{
 				console.log('/jobs/playbook/' + this.network.last_id);
 				$location.path('/jobs/playbook/' + this.network.last_id);
 			}
 		}

        $scope.addNew = function(param) {
            console.log("Add Network infraNetwork" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraNetworksList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.networks.' + this.network.related.opts.fk_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'networks');
        	$window.localStorage.setItem('fk_type', this.network.related.opts.fk_type);
        	$window.localStorage.setItem('fk_id', this.network.id);

            $rootScope.infraJob = "infraNetworksList";

            $state.go('infraJobsList', {job_search:{fk_model:'networks', fk_type:this.network.related.opts.fk_type, fk_id:this.network.id}}, { reload: true });
			console.log("State Go finished");

        };

        $scope.launchNetwork = function(network_id) {
        	LaunchRelatedJobTemplate(defaultUrl, network_id, null, 'template_id', 0, '');
        };

        $scope.poweroffNetwork= function(network_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, network_id, name, 'poweroff_id', 1, 'Power Off');
        };

        $scope.removeNetwork = function(network_id, name) {
        	LaunchRelatedJobTemplate(defaultUrl, network_id, name, 'remove_id', 1, 'Remove');
        };

        $scope.editNetwork= function() {
        	console.log("stateGO");
            console.log('infraNetworksList.edit_' + this.network.related.opts.fk_type);
            $window.localStorage.setItem('form_id', this.network.related.opts.fk_type);
            $state.go('infraNetworksList.edit_' + this.network.related.opts.fk_type, { network_id: this.network.id });
        };

        $scope.deleteNetwork = function(id, name) {
			DeleteInfrastructure(defaultUrl, id, name, 'networks',  this.network.related.opts.fk_type);
        };
    }
];
