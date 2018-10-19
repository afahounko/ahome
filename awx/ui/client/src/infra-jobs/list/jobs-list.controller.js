/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$stateParams', 'Rest', 'JobList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter', 'JobTemplateModel', 'WorkflowJobTemplateModel', 'PromptService',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($window, $scope, $rootScope, $stateParams, Rest, JobList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, JobTemplate, WorkflowTemplate, PromptService, rbacUiControlService,
    Dataset, i18n) {
    	
        var list = JobList,
        	fk_model = $window.localStorage.getItem('fk_model'),
        	fk_type =  $window.localStorage.getItem('fk_type'),
        	fk_id =  $window.localStorage.getItem('fk_id'),
        	defaultUrl = GetBasePath('ipam_infrastructure_jobs');
        var project_id, template_id;
        init();

        function init() {
        	var job, cnt;
			$scope.canAdd = false;
            $rootScope.infraJob = fk_model.toUpperCase() + " - " + fk_type.toUpperCase() + " - " + "INFRA JOB";
            
            rbacUiControlService.canAdd('ipam_infrastructure_jobs')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
	        $scope.$watchCollection(list.name, function(){
	            _.forEach($scope[list.name], processJobRow);
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

	    function processJobRow(job) {
	    	console.log('ProcessJobRow');
	    	console.log(job);
			defaultUrl = GetBasePath('ipam_infrastructure_jobs') + job.id;
            Wait('start');
            Rest.setUrl(defaultUrl);
            Rest.get(defaultUrl).then(({data}) => {
            	var template_id = data.opts.template_id;
            	Rest.setUrl(GetBasePath('job_templates') + template_id);
            	Rest.get(defaultUrl).then(({data}) => {
            		console.log(data);
			        job.job_status = data.summary_fields.last_job.status;
	 			})
	            .catch(({data, status}) => {
	                ProcessErrors($scope, data, status, null, {
	                    hdr: i18n._('Error!'),
	                    msg: i18n.sprintf(i18n._('Failed to retrieve Template: %s. GET status: '), $stateParams.id) + status
	                });
	            });
 			})
            .catch(({data, status}) => {
                ProcessErrors($scope, data, status, null, {
                    hdr: i18n._('Error!'),
                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), $stateParams.id) + status
                });
            });
            
	        console.log(inventory);
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
 
        $scope.launchJob= function(job_id) {
        	defaultUrl = GetBasePath('ipam_infrastructure_jobs') + job_id;
            Wait('start');
            Rest.setUrl(defaultUrl);
            Rest.get(defaultUrl).then(({data}) => {
            	var template_id = data.opts.template_id;
            	console.log(template_id);
            	const jobTemplate = new JobTemplate();
            	const selectedJobTemplate = jobTemplate.create();
	            const preLaunchPromises = [
	                selectedJobTemplate.getLaunch(template_id),
	                selectedJobTemplate.optionsLaunch(template_id),
	            ];
				
	            Promise.all(preLaunchPromises)
	                .then(([launchData, launchOptions]) => {
	                    if (selectedJobTemplate.canLaunchWithoutPrompt()) {
	                        selectedJobTemplate
	                            .postLaunch({ id: template_id })
	                            .then(({ data }) => {
	                                $state.go('output', { id: data.job, type: 'playbook' }, { reload: true });
	                            });
	                    } else {
	                        const promptData = {
	                            launchConf: launchData.data,
	                            launchOptions: launchOptions.data,
	                            template: template_id,
	                            templateType: 'job_template',
	                            prompts: PromptService.processPromptValues({
	                                launchConf: launchData.data,
	                                launchOptions: launchOptions.data
	                            }),
	                            triggerModalOpen: true
	                        };

	                        if (launchData.data.survey_enabled) {
	                            selectedJobTemplate.getSurveyQuestions(template_id)
	                                .then(({ data }) => {
	                                    const processed = PromptService.processSurveyQuestions({
	                                        surveyQuestions: data.spec
	                                    });
	                                    promptData.surveyQuestions = processed.surveyQuestions;
	                                    //vm.promptData = promptData;
	                                });
	                        } else {
	                            //vm.promptData = promptData;
	                        }
	                    }
	                });
 			})
            .catch(({data, status}) => {
                ProcessErrors($scope, data, status, null, {
                    hdr: i18n._('Error!'),
                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), $stateParams.id) + status
                });
            });
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
                Rest.get(defaultUrl).then(({data}) => {
                	console.log(data);
                	project_id = data.opts.project_id;
                	template_id = data.opts.template_id;
                	console.log(project_id);
					console.log(template_id);
					Rest.setUrl(GetBasePath('projects') + project_id + '/');
	                Rest.destroy()
	                    .then(() => {
	                    })
	                    .catch(({data, status}) => {
	                        ProcessErrors($scope, data, status, null, {
	                            hdr: i18n._('Error!'),
	                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE Related Project returned status: '), url) + status
	                        });
	                    });

		            Rest.setUrl(GetBasePath('job_templates') + template_id + '/');
	                Rest.destroy()
	                    .then(() => {
	                    })
	                    .catch(({data, status}) => {
	                        ProcessErrors($scope, data, status, null, {
	                            hdr: i18n._('Error!'),
	                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE Related JobTemplate returned status: '), url) + status
	                        });
	                    });
	                    
	                    
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
                })
	            .catch(({data, status}) => {
	                ProcessErrors($scope, data, status, null, {
	                    hdr: i18n._('Error!'),
	                    msg: i18n.sprintf(i18n._('Failed to retrieve App: %s. GET status: '), $stateParams.id) + status
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
