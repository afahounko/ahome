/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

const user_type_options = [
 { type: 'normal', label: N_('Normal User') },
 { type: 'system_auditor', label: N_('System Auditor') },
 { type: 'system_administrator', label: N_('System Administrator') },
];

export default ['$window', '$scope', '$rootScope', 'JobForm', 'GenerateForm', 'Rest','ParseTypeChange',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath', 'MultiCredentialService',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n','ParseVariableString',
    function($window, $scope, $rootScope, JobForm, GenerateForm, Rest, ParseTypeChange, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, MultiCredentialService, Wait, CreateSelect2,
    $state, $location, i18n, ParseVariableString) {

        var defaultUrl = GetBasePath('ipam_infrastructure_jobs'),
        	fk_model = $window.localStorage.getItem('fk_model'),
        	fk_type =  $window.localStorage.getItem('fk_type'),
        	fk_id =  $window.localStorage.getItem('fk_id'),
        	id_type = $window.localStorage.getItem('form_id'),
            form = JobForm[id_type],
        	credents = [],
        	poweroff_credents = [],
        	remove_credents = [],
        	mcredentials = [];

        init();

        function init() {
            // apply form definition's default field values
			console.log("Add FORM Init");
			console.log(fk_model);
        	console.log(fk_type);
        	console.log(fk_id);
			console.log(id_type);
			console.log(form);
            GenerateForm.applyDefaults(form, $scope);

			$scope.paramCategory = fk_model + '.' + fk_type

            $scope.isAddForm = true;
            
			$scope.status1 = "active";
            $scope.tabId = 1;
			$scope.previous = "CLOSE";
			$scope.next = "NEXT";
			
	        var datacenter_options = [];
			var datacenterLists = [];
	    	Rest.setUrl(GetBasePath('ipam_datacenters'));
	        Rest.get().then(({data}) => {
	        	datacenterLists = data.results;
	        	for (var i = 0; i < datacenterLists.length; i++) {
	        		datacenter_options.push({label:datacenterLists[i].name, value:datacenterLists[i].id});
	        	}
	        	$scope.datacenter_type_options = datacenter_options;l
	            for (var i = 0; i < datacenter_options.length; i++) {
	                if (datacenter_options[i].value === datacenter_value) {
	                    $scope.datacenter = datacenter_options[i];
	                    break;
	                }
	            }
	        })
	    	.catch(({data, status}) => {
	        	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get datacenters. Get returned status: ') + status });
			});

			var credential_options = [];
			Rest.setUrl(GetBasePath('credentials'));
	        Rest.get().then(({data}) => {
	        	var credentialLists = data.results;
	        	for (var i = 0; i < credentialLists.length; i++)
	        		credential_options.push({label:credentialLists[i].name, value:credentialLists[i].id});
	        	$scope.credential_type_options = credential_options;
				//Set Selectbox
				for (var i = 0; i < credential_options.length; i++) {
	                if (credential_options[i].value === credential_value) {
	                    $scope.credential = credential_options[i];
	                    break;
	                }
	            }
	        })
	    	.catch(({data, status}) => {
	        	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get Credentials. Get returned status: ') + status });
			});
	        CreateSelect2({
	            element: '#' + id_type + '_datacenter',
	            multiple: false,
	        }); 

	        CreateSelect2({
	            element: '#' + id_type + '_credential',
	            multiple: false,
	        });
	       	//for multi credential 2018/10/25
            MultiCredentialService.getCredentialTypes()
            .then(({ data }) => {
                $scope.multiCredential = {
                    credentialTypes: data.results,
                    selectedCredentials: []
                };
            });


            if(form.configure_job.credentials)
            {
        		var cred_ids = {};
				cred_ids = form.configure_job.credentials.split(',');
				console.log(cred_ids);
				for(var ind = 0; ind < cred_ids.length; ind ++)
				{
					var tmp_cred = {};
					tmp_cred.id = parseInt(cred_ids[ind]);
					credents.push(tmp_cred);
				}
			}
			console.log(credents);
            if(form.poweroff_job.credentials)
            {
        		var cred_ids = {};
				cred_ids = form.poweroff_job.credentials.split(',');
				console.log(cred_ids);
				for(var ind = 0; ind < cred_ids.length; ind ++)
				{
					var tmp_cred = {};
					tmp_cred.id = parseInt(cred_ids[ind]);
					poweroff_credents.push(tmp_cred);
				}
			}
			console.log(poweroff_credents);
            if(form.remove_job.credentials)
            {
        		var cred_ids = {};
        		
				cred_ids = form.remove_job.credentials.split(',');
				console.log(cred_ids);
				for(var ind = 0; ind < cred_ids.length; ind ++)
				{
					var tmp_cred = {};
					tmp_cred.id = parseInt(cred_ids[ind]);
					remove_credents.push(tmp_cred);
				}
			}
			console.log(remove_credents);
			
            // change to modal dialog

            var element = document.getElementById("modaldlg");
            element.style.display = "block";
            var panel = element.getElementsByClassName("Panel ng-scope");
            panel[0].classList.add("modal-dialog");
            panel[0].style.width = "60%";

        }

		var callback = function() {
            // Make sure the form controller knows there was a change
            $scope[form.name + '_form'].$setDirty();
        };

        $scope.toggleForm = function(key) {
            $scope[key] = !$scope[key];
        };

		function getVars(str){
            // Quick function to test if the host vars are a json-object-string,
            // by testing if they can be converted to a JSON object w/o error.
            function IsJsonString(str) {
                try {
                    JSON.parse(str);
                } catch (e) {
                    return false;
                }
                return true;
            }

            if(str === ''){
                return '---';
            }
            else if(IsJsonString(str)){
                str = JSON.parse(str);
                return jsyaml.safeDump(str);
            }
            else if(!IsJsonString(str)){
                return str;
            }
        }
        
		$scope.WizardClick = function (clickID) {
			if (clickID == 1) {
				if($scope.tabId > 1)
					$scope.tabId = $scope.tabId - 1;
			}
			else if (clickID == 2) {
				 
				if($scope.tabId < 3)
				{
					$scope.tabId = $scope.tabId + 1;
				}
				if($scope.tabId == 1)
				{
					$scope.opts = "---";
				}
				if($scope.tabId == 3)
				{
					var fld, subid;
					var data = "{";
					console.log($scope);
					for (fld in form.fields) {
						
						if(fld == "datacenter" || fld == "credential")
						{
							data += "'" + fld + "':";
			            	if($scope[fld] != undefined) data += "'" + $scope[fld].value + "'";
			            	else data += "''";
			            	data += ",\n"; 
			            	continue;
						}
						if(fld == "multiCredential")
						{
							mcredentials = [];
							data += "'" + fld + "':";
							if($scope[fld]['selectedCredentials'] != undefined)
							{
								data += "'"
								for(subid in $scope[fld]['selectedCredentials']){
									var cred = {};
									console.log($scope[fld]['selectedCredentials'][subid]);
									cred.id = $scope[fld]['selectedCredentials'][subid].id;
									data += $scope[fld]['selectedCredentials'][subid].id + ',';
									mcredentials.push(cred);
								}
								data += "',"; 
							}
							else data += "'',";
							data+= "\n";
							console.log(mcredentials);
							continue;
						}
		            	if(fld != "opts")
		            	{
			            	data += "'" + fld + "':";
			            	if($scope[fld] != undefined) data += "'" + $scope[fld] + "'";
			            	else data += "''";
			            	data += ",\n"; 
			            }
		            }
		            data += "'id_type':'" + id_type + "',\n";
		            data += "'fk_model':'" + fk_model + "',\n";
		            data += "'fk_type':'" + fk_type + "',\n";
		            data += "'fk_id':'" + fk_id + "',\n";
		            data += "'scm_type':''\n";
		        	data += "}";
		            $scope.opts = ParseVariableString(data);
					$scope.parseTypeOpts = 'yaml';
					console.log(form);
			        ParseTypeChange({
			            scope: $scope,
			            field_id: id_type + '_opts',
			            variable: 'opts',
			            onChange: callback,
			            parse_variable: 'parseTypeOpts'
			        });
				}
			}

			if ($scope.tabId == 1) {
				$scope.status1 = "active";
				$scope.status2 = "";
				$scope.status3 = "";
			}
			else if ($scope.tabId == 2) {
				$scope.status1 = "complete";
				$scope.status2 = "active";
				$scope.status3 = "";
			}
			else if ($scope.tabId == 3) {
				$scope.status1 = "complete";
				$scope.status2 = "complete";
				$scope.status3 = "active";
			}
		};

        // prepares a data payload for a PUT request to the API
        var processNewData = function(fields) {
            var data = {};
            _.forEach(fields, function(value, key) {
                if ($scope[key] !== '' && $scope[key] !== null && $scope[key] !== undefined) {
                    data[key] = $scope[key];
                }
            });
            data.scm_type = "";
            data.fk_model = fk_model;
            data.fk_type = fk_type;
            data.fk_id = fk_id;
			if($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if($scope.credential != null) data.credential = $scope.credential.value;
    		data.opts = $scope.opts;
            return data;
        };
        
        // prepares a data payload for a PUT request to the API
        var processExtravars = function(job_template) {
			var fld, subid;
			var data = "{";
			console.log($scope);
			for (fld in job_template) {
				
            	if(fld != "extra_vars")
            	{
	            	data += "'" + fld + "':";
	            	if(job_template[fld] != undefined) data += "'" + job_template[fld] + "'";
	            	else data += "''";
	            	data += ",\n"; 
	            }
            }
            data += "'extra_vars':''\n";
        	data += "}";
        	
        	/*
        	var data = {};
			for (fld in job_template) {
            	if(fld != "extra_vars")
            	{
	            	data[fld] = job_template[fld];
	            }
            }*/
            return data;
        };
        
        // Save
        $scope.formSave = function() {
        	
			var fld, base, data = {}, data_project = {}, data_job = {};
			var new_project_id = 0, poweroff_id = 0, remove_id = 0;
			Wait('start');
			//Project Saving
			if(form.project)
			{
				data_project = form.project;
				data_project.name = data_project.name_prefix + $scope.name;
	    	
			}
			else
			{
	    		data_project.name = form.configure_label_prefix + $scope.name;
	    		data_project.description = "";
	    		data_project.scm_type = "git";
	    		data_project.scm_url = form.configure_project;
	    		data_project.scm_branch = "";
	    		data_project.scm_clean = true;
	    		data_project.scm_delete_on_update = true;
	    		data_project.credential = null;
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
            	.then(({data}) => {
                	console.log(data);
                	new_project_id = data.id;
					console.log('Project Post Succeed : ' + new_project_id);
					
					//Check if the data_project created successfully or not.
					
					//Rest.get().then(({data}) => {
						//Run this function after 5s delay
						setTimeout(function(){
							//**************************** Make Job_Template named Prefix as "Poweroff_" and "Remove_" ************
							//************************************ Save Poweroff_JobTemplate **********************************
							data_job = form.poweroff_job;
							data_job.name = data_job.name_prefix + $scope.name;
							data_job.project = new_project_id;
							//data_job.extra_vars = processExtravars(data_job);
							
							console.log(data_job);

							Rest.setUrl(GetBasePath('job_templates'));
				            Rest.post(data_job)
					            .then(({data}) => {
					            	
					            	poweroff_id = data.id;
					            	//Add multi credentials for poweroff
					            	/*Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
					            	console.log(mcredentials);
					            	for(var fld in mcredentials)
					            	{
						            	Rest.post(mcredentials[fld]);
					            	}*/
					            	Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
					            	if(poweroff_credents !== null)
					            	{
						            	for(var fld in poweroff_credents)
					            		{
						            		Rest.post(poweroff_credents[fld]);
					            		}
						            }


					            	//************************************ Save Remove_JobTemplate **********************************
									data_job = form.remove_job;
									data_job.name = data_job.name_prefix + $scope.name;
									data_job.project = new_project_id;
									//data_job.extra_vars = processExtravars(data_job);
							
									console.log(data_job);
									
									Rest.setUrl(GetBasePath('job_templates'));
						            Rest.post(data_job)
							            .then(({data}) => {
							            	
							            	remove_id = data.id;
							            	//Add multi credentials for poweroff
							            	Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
							            	if(remove_credents !== null)
							            	{
								            	for(var fld in remove_credents)
							            		{
								            		Rest.post(remove_credents[fld]);
							            		}
								            }
							            	//************************************ Save Configure_JobTemplate **********************************
											data_job = form.configure_job;
											data_job.name = data_job.name_prefix + $scope.name;
											data_job.project = new_project_id;
											//data_job.extra_vars = processExtravars(data_job);
							
											console.log(data_job);
											
											Rest.setUrl(GetBasePath('job_templates'));
								            Rest.post(data_job)
								            .then(({data}) => {
							                	console.log('Job Template Post succeed');
							                	
							                	//Add multi credentials for Configure Job
								            	Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
								            	if(credents !== null)
								            	{
									            	for(var fld in credents)
								            		{
									            		Rest.post(credents[fld]);
								            		}
									            }

							                	//Save Job (Sub Items)
									            Rest.setUrl(defaultUrl);
									            var data_subitem = processNewData(form.fields);
												var opts_field = "'project_id':'" + new_project_id + "',\n" + "'poweroff_id':'" + poweroff_id + "',\n" + "'remove_id':'" + remove_id + "',\n" + "'template_id':'" + data.id + "',\n";
												data_subitem.opts = data_subitem.opts.slice(0, 1) + opts_field + data_subitem.opts.slice(1);
									            
									            Rest.post(data_subitem)
									                .then(({data}) => {
									                    base = $location.path().replace(/^\//, '').split('/')[0];
									                    console.log(base);
									                    if (base === 'ipam_infrastructure_jobs') {
									                        $rootScope.flashMessage = i18n._('New Job successfully created!');
									                        $rootScope.$broadcast("EditIndicatorChange", "Job", data.id);

									                        $state.go('infraJobsList', null, { reload: true});
									                    } else {
									                        ReturnToCaller(1);
									                    }
									                    console.log('InfraJob Post succeed');
									                })
									                .catch(({data, status}) => {
									                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new JOB_SUBITEM. POST returned status: ') + status });
									                });
								                })
								                .catch(({data, status}) => {
								                    Wait('stop');
								                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'),
								                        msg: i18n._('Failed to create new JOB TEMPLATE. POST returned status: ') + status });
								                });
										})
						                .catch(({data, status}) => {
						                    Wait('stop');
						                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'),
						                        msg: i18n._('Failed to create new REMOVE JOB TEMPLATE. POST returned status: ') + status });
						                });
						                
								})
				                .catch(({data, status}) => {
				                    Wait('stop');
				                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'),
				                        msg: i18n._('Failed to create new POWER OFF JOB TEMPLATE. POST returned status: ') + status });
				                });
							}, 15000);
							//****************************************************************************/

			            //defaultprojectUrl = GetBasePath('projects');
						//url = (base === 'teams') ? GetBasePath('teams') + $stateParams.team_id + '/projects/' : defaultprojectUrl;
						//console.log(url);
			        //})
			    	//.catch(({data, status}) => {
			        //	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to Get Project ID. Get returned status: ') + status });
					//});
		            
                })
                .catch(({data, status}) => {
                	Wait('stop');
		            ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'),
		            	msg: i18n._('Failed to create new PROJECT. POST returned status: ') + status });
                });
        };

        $scope.formCancel = function() {
            $state.go('infraJobsList', null, { reload: true});
        };
    }
];
