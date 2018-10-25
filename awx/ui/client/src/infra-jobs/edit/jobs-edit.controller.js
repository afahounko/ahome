/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', 'JobForm', 'GenerateForm', 'Rest','ParseTypeChange',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath', 'MultiCredentialService',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n','ParseVariableString',
    function($window, $scope, $rootScope, JobForm, GenerateForm, Rest, ParseTypeChange, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, MultiCredentialService, Wait, CreateSelect2,
    $state, $location, i18n, ParseVariableString) {

        var master = {}, boxes, box, variable, 
            id = $stateParams.job_id,
        	fk_model = $window.localStorage.getItem('fk_model'),
        	fk_type =  $window.localStorage.getItem('fk_type'),
        	fk_id =  $window.localStorage.getItem('fk_id'),
        	id_type = $window.localStorage.getItem('form_id'),
            form = JobForm[id_type],
            defaultUrl = GetBasePath('ipam_infrastructure_jobs') + id;
        var project_id, template_id, poweroff_id, remove_id;
        console.log($stateParams);
        console.log(JobForm);
        console.log(form);
        init();

        function init() {
            Rest.setUrl(defaultUrl);
            Wait('start');
            Rest.get(defaultUrl).then(({data}) => {
				var itm;
                $scope.job_id = id;
                project_id = data.opts.project_id;
                template_id = data.opts.template_id;
                poweroff_id = data.opts.poweroff_id;
                remove_id = data.opts.remove_id;
                
		        $scope.tabId = 1;
                $scope.status1 = "active";
                for (itm in data.opts)
                {
                	$scope[itm] = data.opts[itm];
                	if(data.opts[itm] === 'true')
                	{
                		$scope[itm] = true;
                	}
                	else if(data.opts[itm] === 'false')
                	{
                		$scope[itm] = false;
                	}
                }
                var datacenter_value = data.opts.datacenter;
                var credential_value = data.opts.credential;
                id_type = data.opts.id_type;
                console.log("ID_TYPE " + id_type);

				//setScopeFields(data);
				//Set YAML/JSON Oots
				var callback = function() {
		            // Make sure the form controller knows there was a change
		            $scope[form.name + '_form'].$setDirty();
		        };

		        var datacenter_options = [];
				var datacenterLists = [];
		    	Rest.setUrl(GetBasePath('ipam_datacenters'));
		        Rest.get().then(({data}) => {
		        	console.log(datacenter_value);
		        	datacenterLists = data.results;
		        	for (var i = 0; i < datacenterLists.length; i++) {
		        		datacenter_options.push({label:datacenterLists[i].name, value:datacenterLists[i].id});
		        	}
		        	$scope.datacenter_type_options = datacenter_options;
		            for (var i = 0; i < datacenter_options.length; i++) {
		            	console.log(''+datacenter_options[i].value);
		                if ((''+datacenter_options[i].value) === datacenter_value) {
		                    $scope.datacenter = datacenter_options[i];
		                    break;
		                }
		            }
		            if(datacenter_value == "") $scope.datacenter = null;
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
		                if ((''+credential_options[i].value) === (''+credential_value)) {
		                    $scope.credential = credential_options[i];
		                    break;
		                }
		            }
		            if(credential_value == "") $scope.credential = null;
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
                
            })
            .catch(({data, status}) => {
                ProcessErrors($scope, data, status, null, {
                    hdr: i18n._('Error!'),
                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), $stateParams.id) + status
                });
            });
            /*//Update UI with backend Python
        	Rest.get(GetBasePath('ipam_infrastructure_ui')).then(({data}) => {
        		console.log("IPAM_INFRA_SOURCES");
        		console.log(data);
        	})
            .catch(({data, status}) => {
                ProcessErrors($scope, data, status, null, {
                    hdr: i18n._('Error!'),
                });
            });	*/
            // change to modal dialog
            var element = document.getElementById("modaldlg");
            element.style.display = "block";
            var panel = element.getElementsByClassName("Panel ng-scope");
            panel[0].classList.add("modal-dialog");
            panel[0].style.width = "60%";
            
            Wait('stop');
        }
        $scope.toggleForm = function(key) {
            $scope[key] = !$scope[key];
        };
		var callback = function() {
            // Make sure the form controller knows there was a change
            $scope[form.name + '_form'].$setDirty();
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
				if($scope.tabId == 2)
				{

					//$scope.opts = getVars(data);
				}
				if($scope.tabId == 3)
				{
					var fld;
					var data = "{\n";
					console.log(form);
					for (fld in form.fields) {
						
						if(fld == "datacenter" || fld == "credential")
						{
							data += "'" + fld + "':";
			            	if($scope[fld] != undefined) data += "'" + $scope[fld].value + "'";
			            	else data += "''";
			            	data += ",\n"; 
			            	continue;
						}
		            	if(fld != "opts")
		            	{
			            	data += "'" + fld + "':";
			            	if($scope[fld] != undefined) data += "'" + $scope[fld] + "'";
			            	else data += "''";
			            	data += ",\n"; 
			            	/*
			                if (form.fields[fld].realName) {
			                    data = data[form.fields[fld].realName] = $scope[fld];
			                }else {
			                    data[fld] = $scope[fld]; 
			                }*/
			            }
		            }
		            data += "'id_type':'" + id_type + "',\n";
		            data += "'fk_model':'" + fk_model + "',\n";
		            data += "'fk_type':'" + fk_type + "',\n";
		            data += "'fk_id':'" + fk_id + "',\n";
		            data += "'scm_type':'',\n";
		            data += "'project_id':'" + project_id + "',\n";
		            data += "'template_id':'" + template_id + "',\n";
					data += "'poweroff_id':'" + poweroff_id + "',\n";
		            data += "'remove_id':'" + remove_id + "'\n";
		        	data += "}";
		        	console.log(data);
		            $scope.opts = ParseVariableString(data);
					$scope.parseTypeOpts = 'yaml';
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

		function setScopeFields(data) {
            _(data)
                .pick(function(value, key) {
                    return form.fields.hasOwnProperty(key) === true;
                })
                .forEach(function(value, key) {
                    $scope[key] = value;
                })
                .value();
            return;
        }

        // prepares a data payload for a PUT request to the API
        var processNewData = function(fields) {
            var data = {};
            _.forEach(fields, function(value, key) {
                if ($scope[key] !== '' && $scope[key] !== null && $scope[key] !== undefined) {
                    data[key] = $scope[key];
                }
            });
            if($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if($scope.credential != null) data.credential = $scope.credential.value;
    		data.opts = $scope.opts;
    		
            return data;
        };

        $scope.formCancel = function() {
            $state.go('infraJobsList', null, { reload: true}, null, { reload: true });
        };

        $scope.formSave = function() {
        	console.log("Update");
            	
			var fld, base, data = {}, data_project = {}, data_job = {};
			Wait('start');
			//Project Saving
    		data_project.name = 'Configure_' + $scope.name;
    		/*data_project.description = "";
    		data_project.scm_type = "git";
    		data_project.scm_url = "https://github.com/ansible/ansible-tower-samples.git";
    		data_project.scm_branch = "";
    		data_project.scm_clean = true;
    		data_project.scm_delete_on_update = true;
    		data_project.credential = null;
    		data_project.timeout = 0;
    		data_project.organization = 1;
    		data_project.scm_update_on_launch = true;
    		data_project.scm_update_cache_timeout = 0;*/

			console.log(data_project);

            //defaultprojectUrl = GetBasePath('projects');
			//url = (base === 'teams') ? GetBasePath('teams') + $stateParams.team_id + '/projects/' : defaultprojectUrl;
			//console.log(url);
            Rest.setUrl(GetBasePath('projects') + project_id + '/');
            Rest.put(data_project)
            	.then(({data}) => {
                	console.log(data);
					//Job Saving
		    		data_job.name = 'Configure_' + $scope.name;
		    		data_job.project = project_id;
		    		data_job.playbook = "hello_world.yml";
		    		
					/*data_job.description = "";
					data_job.job_type = "run";
					data_job.inventory = 1;
					
					data_job.forks = 0;
					data_job.limit = "";
					data_job.verbosity = 0;
					data_job.extra_vars = "webapp_version: 91d7a895302744cfd3c5ad40cc261dec4b796de3";
					data_job.job_tags = "";
					data_job.force_handlers = false;
					data_job.skip_tags = "";
					data_job.start_at_task = "";
					data_job.timeout = 0;
					data_job.use_fact_cache = false;
					data_job.host_config_key = "";
					data_job.ask_diff_mode_on_launch = false;
					data_job.ask_variables_on_launch = false;
					data_job.ask_limit_on_launch = false;
					data_job.ask_tags_on_launch = false;
					data_job.ask_skip_tags_on_launch = false;
					data_job.ask_job_type_on_launch = false;
					data_job.ask_verbosity_on_launch = false;
					data_job.ask_inventory_on_launch = false;
					data_job.ask_credential_on_launch = false;
					data_job.survey_enabled = false;
					data_job.become_enabled = false;
					data_job.diff_mode = false;
					data_job.allow_simultaneous = false;
					data_job.cloud_credential = null;
					data_job.network_credential = null;
					data_job.credential = 1; 
					data_job.vault_credential = null;*/

					console.log(data_job);
					setTimeout(function(){
						//****************************************************************************/
						Rest.setUrl(GetBasePath('job_templates') + template_id + '/');
			            Rest.put(data_job)
			            .then(({data}) => {
			                	console.log('Job Template Post succeed');
			                	
			                	//Save Job (Sub Items)
					            Rest.setUrl(defaultUrl + '/');
					            var data_subitem = processNewData(form.fields);
					            console.log($scope);
					            console.log($scope.name);
					            console.log(data_subitem);
					            
					            Rest.put(data_subitem)
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
						}, 5000);
						//****************************************************************************/

		            //defaultprojectUrl = GetBasePath('projects');
					//url = (base === 'teams') ? GetBasePath('teams') + $stateParams.team_id + '/projects/' : defaultprojectUrl;
					//console.log(url);
		            
                })
                .catch(({data, status}) => {
                	Wait('stop');
		            ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'),
		            	msg: i18n._('Failed to create new PROJECT. POST returned status: ') + status });
                });
        };
    }
];
