/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', 'Rest', 'ProviderList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter', 'JobTemplateModel', 'WorkflowJobTemplateModel', 'PromptService',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($window, $scope, $rootScope, Rest, ProviderList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, JobTemplate, WorkflowTemplate, PromptService, rbacUiControlService,
    Dataset, i18n) {

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
	    	console.log('processProviderRow');
	    	console.log(provider);
            Wait('start');
            Rest.setUrl(GetBasePath('ipam_providers') + provider.id);
            Rest.get(GetBasePath('ipam_providers') + provider.id).then(({data}) => {
            	var template_id = data.opts.template_id;
            	Rest.setUrl(GetBasePath('job_templates') + template_id);
            	Rest.get(GetBasePath('job_templates') + template_id).then(({data}) => {
            		console.log(data);
            		provider.tool_tip = i18n._('Most recent job success. Click to view jobs.');
			        provider.job_status = data.summary_fields.last_job.status;
	 			})
	            .catch(({data, status}) => {
	            	provider.tool_tip = i18n._('Most recent job failed. Click to view jobs.');;
	            	provider.job_status = 'pending';
	            });
 			})
            .catch(({data, status}) => {
                ProcessErrors($scope, data, status, null, {
                    hdr: i18n._('Error!'),
                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), $stateParams.id) + status
                });
            });
	    }
	    
        $scope.addNew = function(param) {
            console.log("Add Provider infraProvider" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraProvidersList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.providers.' + this.provider.related.opts.id_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'providers');
        	$window.localStorage.setItem('fk_type', this.provider.related.opts.id_type);
        	$window.localStorage.setItem('fk_id', this.provider.id);

            $rootScope.infraJob = "infraProvidersList";
			console.log($rootScope.infraJob);

            $state.go('infraJobsList');
			console.log("State Go finished");
        };
        
        $scope.launchProvider= function(provider_id) {
        	console.log("Launch");
            
            Wait('start');
            Rest.setUrl(defaultUrl + provider_id);
            Rest.get(defaultUrl + provider_id).then(({data}) => {
            	
            	var job_template_id = data.opts.template_id;
            	const jobTemplate = new JobTemplate();
            	const selectedJobTemplate = jobTemplate.create();
	            const preLaunchPromises = [
	                selectedJobTemplate.getLaunch(job_template_id),
	                selectedJobTemplate.optionsLaunch(job_template_id),
	            ];
				
	            Promise.all(preLaunchPromises)
	                .then(([launchData, launchOptions]) => {
	                    if (selectedJobTemplate.canLaunchWithoutPrompt()) {
	                        selectedJobTemplate
	                            .postLaunch({ id: job_template_id })
	                            .then(({ data }) => {
	                                $state.go('output', { id: data.job, type: 'playbook' }, { reload: true });
	                            });
	                    } else {
	                        const promptData = {
	                            launchConf: launchData.data,
	                            launchOptions: launchOptions.data,
	                            template: job_template_id,
	                            templateType: 'job_template',
	                            prompts: PromptService.processPromptValues({
	                                launchConf: launchData.data,
	                                launchOptions: launchOptions.data
	                            }),
	                            triggerModalOpen: true
	                        };

	                        if (launchData.data.survey_enabled) {
	                            selectedJobTemplate.getSurveyQuestions(job_template_id)
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
                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), provider_id) + status
                });
            });
        };


        $scope.poweroffProvider= function(provider_id, name) {
        	var action = function() {
        		$('#prompt-modal').modal('hide');
	            Wait('start');
	            Rest.setUrl(defaultUrl + provider_id);
	            Rest.get(defaultUrl + provider_id).then(({data}) => {
	            	
	            	var job_template_id = data.opts.poweroff_id;
	            	const jobTemplate = new JobTemplate();
	            	const selectedJobTemplate = jobTemplate.create();
		            const preLaunchPromises = [
		                selectedJobTemplate.getLaunch(job_template_id),
		                selectedJobTemplate.optionsLaunch(job_template_id),
		            ];
					
		            Promise.all(preLaunchPromises)
		                .then(([launchData, launchOptions]) => {
		                    if (selectedJobTemplate.canLaunchWithoutPrompt()) {
		                        selectedJobTemplate
		                            .postLaunch({ id: job_template_id })
		                            .then(({ data }) => {
		                                $state.go('output', { id: data.job, type: 'playbook' }, { reload: true });
		                            });
		                    } else {
		                        const promptData = {
		                            launchConf: launchData.data,
		                            launchOptions: launchOptions.data,
		                            template: job_template_id,
		                            templateType: 'job_template',
		                            prompts: PromptService.processPromptValues({
		                                launchConf: launchData.data,
		                                launchOptions: launchOptions.data
		                            }),
		                            triggerModalOpen: true
		                        };

		                        if (launchData.data.survey_enabled) {
		                            selectedJobTemplate.getSurveyQuestions(job_template_id)
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
	                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), provider_id) + status
	                });
	            });
    		};
            Prompt({
                hdr: i18n._('PowerOff'),
                resourceName: $filter('sanitize')(name),
                body: '<span class="Prompt-bodyQuery">' + i18n._('Are you sure you want to Power Off ') + '<span class="Modal-titleResourceName">' + $filter('sanitize')(name) + '</span>' + i18n._('?') + '</span>',
                action: action,
                actionText: i18n._('PowerOff')
            });
        };

        $scope.removeProvider = function(provider_id, name) {
        	var action = function() {
        		$('#prompt-modal').modal('hide');
	            Wait('start');
	            Rest.setUrl(defaultUrl + provider_id);
	            Rest.get(defaultUrl + provider_id).then(({data}) => {
	            	
	            	var job_template_id = data.opts.remove_id;
	            	console.log(template_id);
	            	const jobTemplate = new JobTemplate();
	            	const selectedJobTemplate = jobTemplate.create();
		            const preLaunchPromises = [
		                selectedJobTemplate.getLaunch(job_template_id),
		                selectedJobTemplate.optionsLaunch(job_template_id),
		            ];
					
		            Promise.all(preLaunchPromises)
		                .then(([launchData, launchOptions]) => {
		                    if (selectedJobTemplate.canLaunchWithoutPrompt()) {
		                        selectedJobTemplate
		                            .postLaunch({ id: job_template_id })
		                            .then(({ data }) => {
		                                $state.go('output', { id: data.job, type: 'playbook' }, { reload: true });
		                            });
		                    } else {
		                        const promptData = {
		                            launchConf: launchData.data,
		                            launchOptions: launchOptions.data,
		                            template: job_template_id,
		                            templateType: 'job_template',
		                            prompts: PromptService.processPromptValues({
		                                launchConf: launchData.data,
		                                launchOptions: launchOptions.data
		                            }),
		                            triggerModalOpen: true
		                        };

		                        if (launchData.data.survey_enabled) {
		                            selectedJobTemplate.getSurveyQuestions(job_template_id)
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
	                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), provider_id) + status
	                });
	            });
    		};
            
            Prompt({
                hdr: i18n._('Remove'),
                resourceName: $filter('sanitize')(name),
                //body: '<span class="Prompt-bodyQuery">' + i18n._('Are you sure you want to Remove ') + name + i18n._('?') + '</span>',
                body: '<span class="Prompt-bodyQuery">' + i18n._('Are you sure you want to Remove ') + 	'<span class="Modal-titleResourceName">' + $filter('sanitize')(name) + '</span>' + i18n._('?') + '</span>',
                action: action,
                actionText: i18n._('Remove')
            });
        };
        
        $scope.editProvider= function() {
        	console.log("stateGO");
            console.log('infraProvidersList.edit_' + this.provider.related.opts.id_type);
            $window.localStorage.setItem('form_id', this.provider.related.opts.id_type);
            $state.go('infraProvidersList.edit_' + this.provider.related.opts.id_type, { provider_id: this.provider.id });
        };

        $scope.deleteProvider = function(id, name) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                
                Wait('start');
                
                Rest.setUrl(defaultUrl + id);
                Rest.get(defaultUrl).then(({data}) => {
                	console.log(data);
                	project_id = data.opts.project_id;
                	template_id = data.opts.template_id;
                	poweroff_id = data.opts.poweroff_id;
                	remove_id = data.opts.remove_id;
                	console.log(project_id);
					console.log(template_id);

					Rest.setUrl(GetBasePath('projects') + project_id + '/');
	                Rest.destroy();

		            Rest.setUrl(GetBasePath('job_templates') + template_id + '/');
	                Rest.destroy();
	                    
		            Rest.setUrl(GetBasePath('job_templates') + poweroff_id + '/');
	                Rest.destroy()
	                    .then(() => {
	                    })
	                    .catch(({data, status}) => {
	                        console.log('delete JobTemplate + poweroff_id failed');
	                    });
	                    
		            Rest.setUrl(GetBasePath('job_templates') + remove_id + '/');
	                Rest.destroy()
	                    .then(() => {
	                    })
	                    .catch(({data, status}) => {
	                        console.log('delete JobTemplate + remove_id failed');
	                    });
                    
            		if(data.opts.inventory_id){
            			Rest.setUrl(GetBasePath('inventory') + data.opts.inventory_id + '/');
            			Rest.destroy()
            			.then(() => {
            				console.log('related inventory deleted successfully');
            			});
            		}
            		if(data.opts.credential_id){
            			var cred_types = {};
            			cred_types = data.opts.credential_id.split(',');
            			for (var i = 0; i < cred_types.length; i++) {
                				
                			Rest.setUrl(GetBasePath('credentials') + cred_types[i] + '/');
			                Rest.destroy()
			                    .then(() => {
			                        console.log('related credential deleted successfully ' + i);
			                    });
			            }
            		}
                	var url = defaultUrl + id + '/';
	                Rest.setUrl(url);
	                Rest.destroy()
	                    .then(() => {
	                        let reloadListStateParams = null;

	                        if($scope.ipam_providers.length === 1 && $state.params.provider_search && !_.isEmpty($state.params.provider_search.page) && $state.params.provider_search.page !== '1') {
	                            reloadListStateParams = _.cloneDeep($state.params);
	                            reloadListStateParams.provider_search.page = (parseInt(reloadListStateParams.provider_search.page)-1).toString();
	                        }

	                        if (parseInt($state.params.provider_id) === id) {
	                            $state.go('^', null, { reload: true });
	                        } else {
	                            $state.go('.', null, { reload: true });
	                        }
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
                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE returned status: '), defaultUrl + id) + status
                        });
                    });
                
                
            };

            Prompt({
                hdr: i18n._('Delete'),
                resourceName: $filter('sanitize')(name),
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Provider?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
