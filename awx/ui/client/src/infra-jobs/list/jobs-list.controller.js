/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$stateParams', 'Rest', 'JobList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($window, $scope, $rootScope, $stateParams, Rest, JobList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
    Dataset, i18n) {
    	
        var list = JobList,
        	fk_model = $window.localStorage.getItem('fk_model'),
        	fk_type =  $window.localStorage.getItem('fk_type'),
        	fk_id =  $window.localStorage.getItem('fk_id'),
        defaultUrl = GetBasePath('ipam_infrastructure_jobs');
        init();

        function init() {
        	var job, cnt;
			console.log("Init Job");
			console.log($scope.ipam_infrastructure_jobs);
            $scope.canAdd = false;

            $rootScope.infraJob = fk_model.toUpperCase() + " - " + fk_type.toUpperCase() + " - " + "INFRA JOB";
            console.log(fk_model);
        	console.log(fk_type);
        	console.log(fk_id);
            rbacUiControlService.canAdd('ipam_infrastructure_jobs')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[`${list.iterator}_dataset`].results;
    		//$scope[list.name] = $scope[`${list.iterator}_dataset`].results;
    		console.log($scope[`${list.iterator}_dataset`].results);

    		$scope[list.name] = [];
    		cnt = 0;
            for(job in $scope[`${list.iterator}_dataset`].results)
            {
            	console.log(job);
            	if($scope[`${list.iterator}_dataset`].results[job]['fk_model'] === fk_model && $scope[`${list.iterator}_dataset`].results[job]['fk_type'] === fk_type && $scope[`${list.iterator}_dataset`].results[job]['fk_id'] === fk_id)
            	{
            		cnt++;
            		console.log("true here");
            		$scope[list.name].push($scope[`${list.iterator}_dataset`].results[job]);
            	}
            }
            $scope.job_dataset.count = cnt;
            console.log($scope.ipam_infrastructure_jobs);

            $rootScope.flashMessage = null;
            $scope.selected = [];
            
			$scope.paramCategory = fk_model + '.' + fk_type
            console.log($scope.paramCategory);
            
            
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
 
        $scope.launchJob= function() {
        	/*console.log("stateGO");
            console.log('infraJobsList.edit_' + this.job.related.opts.id_type);
            $window.localStorage.setItem('form_id', this.job.related.opts.id_type);
            $state.go('infraJobsList.edit_' + this.job.related.opts.id_type, { job_id: this.job.id });*/
        };

        $scope.editJob= function() {
        	console.log("stateGO");
            console.log('infraJobsList.edit_' + this.job.related.opts.id_type);
            $window.localStorage.setItem('form_id', this.job.related.opts.id_type);
            $state.go('infraJobsList.edit_' + this.job.related.opts.id_type, { job_id: this.job.id });
        };

        $scope.deleteJob = function(id, name) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                Wait('start');
                var url = defaultUrl + id + '/';
                Rest.setUrl(url);
                Rest.destroy()
                    .then(() => {
                        let reloadListStateParams = null;
						console.log('1');
						
                        if($scope.ipam_infrastructure_jobs.length === 1 && $state.params.job_search && !_.isEmpty($state.params.job_search.page) && $state.params.job_search.page !== '1') {
                        	console.log('1-1');
                            reloadListStateParams = _.cloneDeep($state.params);
                            console.log('1-2');
                            reloadListStateParams.job_search.page = (parseInt(reloadListStateParams.job_search.page)-1).toString();
                        }
						console.log('2');
                        if (parseInt($state.params.job_id) === id) {
                            $state.go('^', null, { reload: true });
                        } else {
                            $state.go('.', null, { reload: true });
                        }
                        console.log('3');
                    })
                    .catch(({data, status}) => {
                        ProcessErrors($scope, data, status, null, {
                            hdr: i18n._('Error!'),
                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE returned status: '), url) + status
                        });
                    });
            };

            Prompt({
                hdr: i18n._('Delete'),
                resourceName: $filter('sanitize')(name),
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Job?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
