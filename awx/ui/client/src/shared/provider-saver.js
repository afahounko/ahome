/*************************************************
 * Copyright (c) 2018 Truegardener, Team.
 *
 * All Rights Reserved
 *************************************************/


 /**
 *  @ngdoc overview
 *  @name shared
 *  @description lib files
 *
 */
 /**
 *  @ngdoc function
 *  @name shared.function:provider-saver
 *  @description Save provider under the logic of Ansible.
 *  @ 1. Save inventory
 *  @ 2. Save Host according to inventory's id
 *  @ 3. Save Credentials from yml file.
 *  @ 4. Save Project for the provider
 *  @ 5. Save Job_Template using Project, inventory, credentials.
 *  @ 6. Post Provider with above info.
 *
 */



export default
angular.module('ProviderSaver', ['Utilities'])

.factory('SaveSubItem', ['$http', '$rootScope', '$state', '$location', 'Store', 'ProcessErrors', 'i18n', 'GetBasePath', '$filter', 'Rest', 'Wait', 'Prompt', 
    function ($http, $rootScope, $state, $location, Store, ProcessErrors, i18n, GetBasePath, $filter, Rest, Wait, Prompt) {
        return function (parentData, url, form, data_subitem, extra_vars) {

            var fld, base, data = {}, data_project = {}, data_job = {};
            var new_project_id = 0, poweroff_id = 0, remove_id = 0;
            var scope = data_subitem;
			console.log(scope);
            Wait('start');
            
            var credents = [],
            poweroff_credents = [],
            remove_credents = [];

			console.log(form.configure_job.credentials);
            if (form.configure_job.credentials !== undefined && form.configure_job.credentials !== null) {
                var cred_ids = {};
                cred_ids = form.configure_job.credentials.split(',');
                console.log(cred_ids);
                for (var ind = 0; ind < cred_ids.length; ind++) {
                    var tmp_cred = {};
                    tmp_cred.id = parseInt(cred_ids[ind]);
                    credents.push(tmp_cred);
                }
            }
            console.log(credents);
            if (form.poweroff_job.credentials !== undefined && form.poweroff_job.credentials !== null) {
                var cred_ids = {};
                cred_ids = form.poweroff_job.credentials.split(',');
                console.log(cred_ids);
                for (var ind = 0; ind < cred_ids.length; ind++) {
                    var tmp_cred = {};
                    tmp_cred.id = parseInt(cred_ids[ind]);
                    poweroff_credents.push(tmp_cred);
                }
            }
            console.log(poweroff_credents);
            if (form.remove_job.credentials !== undefined && form.remove_job.credentials !== null) {
                var cred_ids = {};

                cred_ids = form.remove_job.credentials.split(',');
                console.log(cred_ids);
                for (var ind = 0; ind < cred_ids.length; ind++) {
                    var tmp_cred = {};
                    tmp_cred.id = parseInt(cred_ids[ind]);
                    remove_credents.push(tmp_cred);
                }
            }
            console.log(remove_credents);


            //Project Saving
            if (form.project) {
                data_project = form.project;
                data_project.name = data_project.name_prefix + scope.name;
            }
            else {
                data_project.name = form.configure_label_prefix + scope.name;
                data_project.description = "";
                data_project.scm_type = "git";
                data_project.scm_url = form.configure_project;
                data_project.scm_branch = "";
                data_project.scm_clean = true;
                data_project.scm_delete_on_update = true;
                data_project.credential = parentData.opts.credential_id;  //2018.10.27 get credential id from parent
                data_project.timeout = 0;
                data_project.organization = 1;
                data_project.scm_update_on_launch = true;
                data_project.scm_update_cache_timeout = 0;
            }
            console.log(data_project);

            console.log(credents);
            //defaultprojectUrl = GetBasePath('projects');
            //url = (base === 'teams') ? GetBasePath('teams') + $stateParams.team_id + '/projects/' : defaultprojectUrl;
            //console.log(url);
            Rest.setUrl(GetBasePath('projects'));
            Rest.post(data_project)
                .then(({ data }) => {
                    console.log(data);
                    new_project_id = data.id;
                    console.log('Project Updated Succeed : ' + new_project_id);
                    
                    //Check if the data_project created successfully or not. (here the status must be 'successful' when it created successfully)
                    var interval = setInterval(function () {
                        Rest.setUrl(GetBasePath('projects') + new_project_id + '/');
                        Rest.get().then(({ data }) => {
                        	console.log('Data get succeed');

                            if (data.status == 'successful') {
                            	console.log('Project status is succesful');
                                //**************************** Make Job_Template named Prefix as "Poweroff_" and "Remove_" ************
                                //************************************ Save Poweroff_JobTemplate **********************************
                                data_job = form.poweroff_job;
                                data_job.name = data_job.name_prefix + scope.name;
                                data_job.project = new_project_id;
                                data_job.credential = parentData.opts.new_ssh_credential;
                                data_job.inventory = parentData.opts.inventory_id;
                                data_job.extra_vars = extra_vars;

                                console.log(data_job);

                                Rest.setUrl(GetBasePath('job_templates'));
                                Rest.post(data_job)
                                    .then(({ data }) => {

                                        poweroff_id = data.id;
                                        Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
                                        if (poweroff_credents !== null) {
                                            for (var fld in poweroff_credents) {
                                                Rest.post(poweroff_credents[fld]);
                                            }
                                        }
                                        //************************************ Save Remove_JobTemplate **********************************
                                        data_job = form.remove_job;
                                        data_job.name = data_job.name_prefix + scope.name;
                                        data_job.project = new_project_id;
                                        data_job.inventory = parentData.opts.inventory_id;
                                        data_job.credential = parentData.opts.new_ssh_credential;
                                        //data_job.extra_vars = processExtravars(data_job);
                                        data_job.extra_vars = extra_vars;

                                        console.log(data_job);

                                        Rest.setUrl(GetBasePath('job_templates'));
                                        Rest.post(data_job)
                                            .then(({ data }) => {

                                                remove_id = data.id;
                                                //Add multi credentials for poweroff
                                                Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
                                                if (remove_credents !== null) {
                                                    for (var fld in remove_credents) {
                                                        Rest.post(remove_credents[fld]);
                                                    }
                                                }
                                                //************************************ Save Configure_JobTemplate **********************************
                                                data_job = form.configure_job;
                                                data_job.name = data_job.name_prefix + scope.name;
                                                data_job.project = new_project_id;
                                                data_job.inventory = parentData.opts.inventory_id;
                                                data_job.credential = parentData.opts.new_ssh_credential;
                                                //data_job.extra_vars = processExtravars(data_job);
												data_job.extra_vars = extra_vars;

                                                console.log(data_job);

                                                Rest.setUrl(GetBasePath('job_templates'));
                                                Rest.post(data_job)
                                                    .then(({ data }) => {
                                                        console.log('Job Template Post succeed');

                                                        //Add multi credentials for Configure Job
                                                        Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
                                                        if (credents !== null) {
                                                            for (var fld in credents) {
                                                                Rest.post(credents[fld]);
                                                            }
                                                        }

                                                        //Save Job (Sub Items)
                                                        Rest.setUrl(defaultUrl);
                                                        var opts_field = "'project_id':'" + new_project_id + "',\n" + "'poweroff_id':'" + poweroff_id + "',\n" + "'remove_id':'" + remove_id + "',\n" + "'template_id':'" + data.id + "',\n";
                                                        data_subitem.opts = data_subitem.opts.slice(0, 1) + opts_field + data_subitem.opts.slice(1);

                                                        Rest.post(data_subitem)
                                                            .then(({ data }) => {
                                                                base = $location.path().replace(/^\//, '').split('/')[0];
                                                                console.log(base);
                                                                if (base === 'ipam_infrastructure_jobs') {
                                                                    $rootScope.flashMessage = i18n._('New Job successfully created!');
                                                                    $rootScope.$broadcast("EditIndicatorChange", "Job", data.id);

                                                                    $state.go('infraJobsList', null, { reload: true });
                                                                } else {
                                                                    ReturnToCaller(1);
                                                                }
                                                                console.log('InfraJob Post succeed');
                                                            })
                                                            .catch(({ data, status }) => {
                                                                ProcessErrors(null, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new JOB_SUBITEM. POST returned status: ') + status });
                                                            });
                                                    })
                                                    .catch(({ data, status }) => {
                                                        Wait('stop');
                                                        ProcessErrors(null, data, status, form, {
                                                            hdr: i18n._('Error!'),
                                                            msg: i18n._('Failed to create new JOB TEMPLATE. POST returned status: ') + status
                                                        });
                                                    });
                                            })
                                            .catch(({ data, status }) => {
                                                Wait('stop');
                                                ProcessErrors(null, data, status, form, {
                                                    hdr: i18n._('Error!'),
                                                    msg: i18n._('Failed to create new REMOVE JOB TEMPLATE. POST returned status: ') + status
                                                });
                                            });

                                    })
                                    .catch(({ data, status }) => {
                                        Wait('stop');
                                        ProcessErrors(null, data, status, form, {
                                            hdr: i18n._('Error!'),
                                            msg: i18n._('Failed to create new POWER OFF JOB TEMPLATE. POST returned status: ') + status
                                        });
                                    });
                                clearInterval(interval);
                            }
                        })
                    }, 1000);
                    //****************************************************************************/

                    //defaultprojectUrl = GetBasePath('projects');
                    //url = (base === 'teams') ? GetBasePath('teams') + $stateParams.team_id + '/projects/' : defaultprojectUrl;
                    //console.log(url);
                    //})
                    //.catch(({data, status}) => {
                    //	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to Get Project ID. Get returned status: ') + status });
                    //});

                })
                .catch(({ data, status }) => {
                    Wait('stop');
                    ProcessErrors(null, data, status, form, {
                        hdr: i18n._('Error!'),
                        msg: i18n._('Failed to create new PROJECT. POST returned status: ') + status
                    });
                });
        };
    }
])

.factory('SaveProvider', ['$http', '$rootScope', '$state', '$location', 'Store', 'ProcessErrors', 'i18n', 'GetBasePath', '$filter', 'Rest', 'Wait', 'Prompt', 
    function ($http, $rootScope, $state, $location, Store, ProcessErrors, i18n, GetBasePath, $filter, Rest, Wait, Prompt) {
        return function (url, form, data_item) {
			var fld, data = {}, data_project = {}, data_job = {};
			var inventory_data = {}, host_data = {};
			var new_inventory_id = 0, new_host_id = 0, new_credents = [], new_ssh_credential = 0, new_project_id = 0, poweroff_id = 0, remove_id = 0;
			var scope = data_item;
			console.log(scope);
            //if(id_type == "vmware_vcenter")   // for now it is for Vmwarevcenter
            //{
			    Wait('start');
				
				//Posting Inventory for this provider
	            inventory_data.name = scope.name + ' Inventory';
	            inventory_data.organization = 1;
        		Rest.setUrl(GetBasePath('inventory'));
                Rest.post(inventory_data)
                	.then(({data}) => {
			        	var cred_types = {};
						var credential_data = [];
					    var credential_create_succeed = 0;
			        	var opts_field;
						var job_extra_vars = {};
			        	new_inventory_id = data.id;
			        	opts_field = "'inventory_id':'" + data.id + "'\n,";
                		data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
				        
				        host_data.name = scope.name.toLowerCase() + '_endpoint';
				        host_data.inventory = data.id;
				        host_data.variables = 'ansible_connection: local';
				        
				        //Posting Host for this provider using Inventory posted above 2018/11/7
				        Rest.setUrl(GetBasePath('hosts'));
		                Rest.post(host_data)
		                	.then(({data}) => {
		                		new_host_id = data.id;
		                		opts_field = "'host_id':'" + data.id + "'\n,";
		                		data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
		                		
						        opts_field = "'credential_id':'";
					            cred_types = form.credential_types.split(',');
					            console.log(cred_types);
					            
					            //Posting Multi Credential for the Provider
					            for (var i = 0; i < cred_types.length; i++) {
					            	
					            	//credential_data.credential_type = form.inventory_type;
					        		credential_data[i] = {};
					            	credential_data[i].credential_type = cred_types[i];
					            	
					            	if(i>0) credential_data[i].name = scope.name;
					            	else  credential_data[i].name = form.credential_prefix + scope.name;
						            credential_data[i].description = scope.description;
						            credential_data[i].user = 1;   // only for user type
						            credential_data[i].inputs = {};
						        	if(i>0) credential_data[i].inputs.host = scope.host;
						        	credential_data[i].inputs.username = scope.username;
						        	credential_data[i].inputs.password = scope.password;
						        	
					            	console.log(i);
					            	console.log(cred_types[i]);
					            	console.log(credential_data[i].credential_type);
					            	console.log(credential_data[i]);
					            	
						            Rest.setUrl(GetBasePath('credentials'));
							        Rest.post(credential_data[i])
						                .then(({data}) => {
						                	console.log('credential successfully created!!!' + credential_data.credential_type);
						                	new_credents.push(data);
						                	console.log(data);

						                	opts_field = opts_field + data.id + ',';
						                	credential_create_succeed = credential_create_succeed + 1;
						                	if(credential_create_succeed == cred_types.length)	//All credentials are Created successfully.
						                	{
						                		for (var i = 0; i < new_credents.length; i++) {
						                			if(new_credents[i].credential_type == 1)
						                				new_ssh_credential = new_credents[i].id;
						                		}

                                                console.log(opts_field);
                                                opts_field = opts_field.substring(0, opts_field.length-1);
                                                opts_field = opts_field + "'\n,";
                                                opts_field = opts_field + "'new_ssh_credential':'" + new_ssh_credential + "'\n,'";
						                		data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
						                		console.log(data_item);
						                		
												//Project Posting 2018.11.7
								                data_project = form.project;
								                data_project.name = data_project.name_prefix + scope.name;
									            Rest.setUrl(GetBasePath('projects'));
									            Rest.post(data_project)
									                .then(({ data }) => {
									                    console.log(data);
									                    opts_field = "'project_id':'" + data.id + "'\n,";
		                								data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
		                								console.log(data_item.opts);
		                								job_extra_vars = data_item.opts;
									                    new_project_id = data.id;
									                    console.log('Project Post Succeed : ' + new_project_id);
									                    
									                    //Check if the data_project created successfully or not. (here the status must be 'successful' when it created successfully)
									                    var interval = setInterval(function () {
									                        Rest.setUrl(GetBasePath('projects') + new_project_id + '/');
									                        Rest.get().then(({ data }) => {
									                        	console.log('Data get succeed');

									                            if (data.status == 'successful') {
									                            	console.log('Project status is succesful');
									                                //**************************** Make Job_Template named Prefix as "Poweroff_" and "Remove_" ************
									                                //************************************ Save Poweroff_JobTemplate **********************************
									                                data_job = form.poweroff_job;
									                                data_job.name = data_job.name_prefix + scope.name;
									                                data_job.project = new_project_id;
									                                data_job.credential = new_ssh_credential;
									                                data_job.inventory = new_inventory_id;
									                                data_job.extra_vars = job_extra_vars;

									                                console.log(data_job);

									                                Rest.setUrl(GetBasePath('job_templates'));
									                                Rest.post(data_job)
									                                    .then(({ data }) => {
																			opts_field = "'poweroff_id':'" + data.id + "'\n,";
		                													data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);

									                                        poweroff_id = data.id;
									                                        //Add multi credentials for poweroff
									                                        Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
									                                        console.log(new_credents);
									                                        for (var i = 0; i < new_credents.length; i++)
									                                        {
									                                    		var tmp = {};
									                                    		tmp.id = new_credents[i].id;
									                                            Rest.post(tmp);
									                                        }
									                                        //************************************ Save Remove_JobTemplate **********************************

											                                data_job = form.remove_job;
											                                data_job.name = data_job.name_prefix + scope.name;
											                                data_job.project = new_project_id;
											                                data_job.credential = new_ssh_credential;
											                                data_job.inventory = new_inventory_id;
											                                data_job.extra_vars = job_extra_vars;

									                                        console.log(data_job);

									                                        Rest.setUrl(GetBasePath('job_templates'));
									                                        Rest.post(data_job)
									                                            .then(({ data }) => {
																				opts_field = "'remove_id':'" + data.id + "'\n,";
		                														data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
		                								
									                                                remove_id = data.id;
									                                                //Add multi credentials for poweroff
									                                                Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
											                                        for (var i = 0; i < new_credents.length; i++)
											                                        {
											                                    		var tmp = {};
											                                    		tmp.id = new_credents[i].id;
											                                            Rest.post(tmp);
											                                        }
									                                                //************************************ Save Configure_JobTemplate **********************************

													                                data_job = form.configure_job;
													                                data_job.name = data_job.name_prefix + scope.name;
													                                data_job.project = new_project_id;
													                                data_job.credential = new_ssh_credential;
													                                data_job.inventory = new_inventory_id;
													                                data_job.extra_vars = job_extra_vars;

									                                                console.log(data_job);

									                                                Rest.setUrl(GetBasePath('job_templates'));
									                                                Rest.post(data_job)
									                                                    .then(({ data }) => {
									                                                        console.log('Job Template Post succeed');
																							opts_field = "'template_id':'" + data.id + "'\n,";
					                														data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
					                														
									                                                        //Add multi credentials for Configure Job
									                                                        Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
													                                        for (var i = 0; i < new_credents.length; i++)
													                                        {
													                                    		var tmp = {};
													                                    		tmp.id = new_credents[i].id;
													                                            Rest.post(tmp);
													                                        }
																	                		
																	                		Rest.setUrl(url);
																			                Rest.post(data_item)
																				                .then(({data}) => {
																				                	console.log('Provider created!!!');
																				                    var base = $location.path().replace(/^\//, '').split('/')[0];
																				                    if (base === 'ipam_providers') {
																				                        $rootScope.flashMessage = i18n._('New Provider successfully created!');
																				                        $rootScope.$broadcast("EditIndicatorChange", "Provider", data.id);
																				                        $state.go('infraProvidersList', null, { reload: true });
																				                    } else {
																				                        ReturnToCaller(1);
																				                    }
																				                })
																				                .catch(({data, status}) => {
																				                    ProcessErrors(null, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new Provider. POST returned status: ') + status });
																				                });
									                                                    })
									                                                    .catch(({ data, status }) => {
									                                                        Wait('stop');
									                                                        ProcessErrors(null, data, status, form, {
									                                                            hdr: i18n._('Error!'),
									                                                            msg: i18n._('Failed to create new JOB TEMPLATE. POST returned status: ') + status
									                                                        });
									                                                    });
									                                            })
									                                            .catch(({ data, status }) => {
									                                                Wait('stop');
									                                                ProcessErrors(null, data, status, form, {
									                                                    hdr: i18n._('Error!'),
									                                                    msg: i18n._('Failed to create new REMOVE JOB TEMPLATE. POST returned status: ') + status
									                                                });
									                                            });

									                                    })
									                                    .catch(({ data, status }) => {
									                                        Wait('stop');
									                                        ProcessErrors(null, data, status, form, {
									                                            hdr: i18n._('Error!'),
									                                            msg: i18n._('Failed to create new POWER OFF JOB TEMPLATE. POST returned status: ') + status
									                                        });
									                                    });
									                                clearInterval(interval);
									                            }
									                        })
									                    }, 1000);
									                })
									                .catch(({ data, status }) => {
									                    Wait('stop');
									                    ProcessErrors(null, data, status, form, {
									                        hdr: i18n._('Error!'),
									                        msg: i18n._('Failed to create new PROJECT. POST returned status: ') + status
									                    });
									                });
						                	}
								            //opts_field = opts_field + data.id + ',';
						            });
					            }
		            	});
		        });
    	/*}
            else
            {
	            Rest.setUrl(defaultUrl);
	            var data = processNewData(form.fields);
	            Wait('start');
	            Rest.post(data)
	                .then(({data}) => {
	                    var base = $location.path().replace(/^\//, '').split('/')[0];
	                    if (base === 'ipam_providers') {
	                        $rootScope.flashMessage = i18n._('New Provider successfully created!');
	                        $rootScope.$broadcast("EditIndicatorChange", "Provider", data.id);
	                        
	                        $state.go('infraProvidersList', null, { reload: true });
	                    } else {
	                        ReturnToCaller(1);
	                    }
	                })
	                .catch(({data, status}) => {
	                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new Provider. POST returned status: ') + status });
	                });
	        }*/
        };
    }
])

.factory('LaunchRelatedJobTemplate', ['$http', '$rootScope', 'Store', 'ProcessErrors', 'i18n', '$state', '$filter', 'Rest', 'Wait', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    function ($http, $rootScope, Store, ProcessErrors, i18n, $state, $filter, Rest, Wait, Prompt, JobTemplate, WorkflowJobTemplateModel) {
        return function (url, id, name, template_kind, confirmDialog, confirmName) {
	        var action = function() {
	        	$('#prompt-modal').modal('hide');
				console.log("Launch Job_Template");
	            Wait('start');
	            Rest.setUrl(url + id);
	            Rest.get(url + id).then(({data}) => {
	            	var job_template_id = data.opts[template_kind];
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
					ProcessErrors(null, data, status, null, {
		                    hdr: i18n._('Error!'),
		                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), id) + status
		                });
	            });
	    	};
	    	if(confirmDialog == 1)
	    	{
		    	Prompt({
	                hdr: i18n._(confirmName),
	                resourceName: $filter('sanitize')(name),
	                body: '<span class="Prompt-bodyQuery">' + i18n._('Are you sure you want to ' + confirmName + ' ') + '<span class="Modal-titleResourceName">' + $filter('sanitize')(name) + '</span>' + i18n._('?') + '</span>',
	                action: action,
	                actionText: i18n._(confirmName)
	            });
	        }
	        else
	        {
	        	action();
	        }
        };
        
    }
])

.factory('DeleteRelatedJobTemplate', ['$http', '$rootScope', '$state', 'Store', 'ProcessErrors', 'i18n', 'GetBasePath', '$filter', 'Rest', 'Wait', 'Prompt', 
    function ($http, $rootScope, $state, Store, ProcessErrors, i18n, GetBasePath, $filter, Rest, Wait, Prompt) {
        return function (url, id, name) {
        	var action = function() {
	        	$('#prompt-modal').modal('hide');
                Wait('start');
                Rest.setUrl(url + id);
                Rest.get(url + id).then(({data}) => {
                	var obj = data.opts;
                	console.log(obj);
                	//Remove Project
					if(obj.project_id){
						Rest.setUrl(GetBasePath('projects') + obj.project_id + '/');
		                Rest.destroy()
            			.then(() => {
            				console.log('related project deleted successfully');
            			});
		            }
		            
					//Remove Configure_Job_Template
		            if(obj.template_id){
			            Rest.setUrl(GetBasePath('job_templates') + obj.template_id + '/');
		                Rest.destroy()
            			.then(() => {
            				console.log('related Configure_Job_Template deleted successfully');
            			});
	                }
	                
	                //Remove Poweroff_Job_Template
		            if(obj.poweroff_id){
			            Rest.setUrl(GetBasePath('job_templates') + obj.poweroff_id + '/');
		                Rest.destroy()
            			.then(() => {
            				console.log('related Poweroff_Job_Template deleted successfully');
            			});
	                }
	                
	                //Remove Remove_Job_Template
		            if(obj.remove_id){
			            Rest.setUrl(GetBasePath('job_templates') + obj.remove_id + '/');
		                Rest.destroy()
            			.then(() => {
            				console.log('related Remove_Job_Template deleted successfully');
            			});
                    }
                    
                    //Remove Related Inventory
            		if(obj.inventory_id){
            			Rest.setUrl(GetBasePath('inventory') + obj.inventory_id + '/');
            			Rest.destroy()
            			.then(() => {
            				console.log('related inventory deleted successfully');
            			});
            		}
            		
            		//Remove related Credential
            		if(obj.credential_id){
            			var cred_types = {};
            			cred_types = obj.credential_id.split(',');
            			for (var i = 0; i < cred_types.length; i++) {
                			Rest.setUrl(GetBasePath('credentials') + cred_types[i] + '/');
			                Rest.destroy()
			                    .then(() => {
			                        console.log('related credential deleted successfully ' + i);
			                    });
			            }
            		}
		            //Remove Configure_Job_Template
		            Rest.setUrl(url + id + '/');
		            Rest.destroy()
		                .then(() => {
		                    let reloadListStateParams = null;
		                    if($state.params.provider_search && !_.isEmpty($state.params.provider_search.page) && $state.params.provider_search.page !== '1') {
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
		                    ProcessErrors(null, data, status, null, {
		                        hdr: i18n._('Error!'),
		                        msg: i18n.sprintf(i18n._('Call to %s failed. DELETE returned status: '), url) + status
		                    });
		                });
            		return true;
	 			})
	            .catch(({data, status}) => {
					ProcessErrors(null, data, status, null, {
		                    hdr: i18n._('Error!'),
		                    msg: i18n.sprintf(i18n._('Failed to retrieve %s: %s. GET status: '), url, id) + status
		                });
		            return false;
	            });
	            return false;
	        };
			Prompt({
                hdr: i18n._('Delete'),
                resourceName: $filter('sanitize')(name),
                body: '<span class="Prompt-bodyQuery">' + i18n._('Are you sure you want to Delete ') + '<span class="Modal-titleResourceName">' + $filter('sanitize')(name) + '</span>' + i18n._('?') + '</span>',
                action: action,
                actionText: i18n._('Delete')
            });
        };
    }
])

.factory('processRow', ['$rootScope', '$stateParams', 'Store', 'LoadBasePaths', 'Empty', 'PromptService', 'GetBasePath', 'Rest', 'Wait', 'i18n', 'ProcessErrors',
    function ($rootScope, $stateParams, Store, LoadBasePaths, Empty, JobTemplate, GetBasePath, Rest, Wait, i18n, ProcessErrors) {
        return function (url, obj) {
            // use /api/v2/ results to construct API URLs.
            console.log('Process ' + url);
            Wait('start');
            Rest.setUrl(GetBasePath(url) + obj.id);
            Rest.get(GetBasePath(url) + obj.id).then(({data}) => {
            	var template_id = data.opts.template_id;
            	Rest.setUrl(GetBasePath('job_templates') + template_id);
            	Rest.get(GetBasePath('job_templates') + template_id).then(({data}) => {
            		obj.tool_tip = i18n._('Most recent job success. Click to view jobs.');
			        obj.job_status = data.summary_fields.last_job.status;
			        return obj;
	 			})
	            .catch(({data, status}) => {
	            	obj.tool_tip = i18n._('Most recent job failed. Click to view jobs.');;
	            	obj.job_status = 'pending';
	            	return obj;
	            });
 			})
            .catch(({data, status}) => {
                ProcessErrors(null, data, status, null, {
                    hdr: i18n._('Error!'),
                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), $stateParams.id) + status
                });
                return obj;
            });
        };
    }
]);
