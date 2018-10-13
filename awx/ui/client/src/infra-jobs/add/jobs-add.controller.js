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
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n','ParseVariableString',
    function($window, $scope, $rootScope, JobForm, GenerateForm, Rest, ParseTypeChange, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2,
    $state, $location, i18n, ParseVariableString) {

        var defaultUrl = GetBasePath('ipam_infrastructure_jobs'),
        	fk_model = $window.localStorage.getItem('fk_model'),
        	fk_type =  $window.localStorage.getItem('fk_type'),
        	fk_id =  $window.localStorage.getItem('fk_id'),
        	id_type = $window.localStorage.getItem('form_id'),
            form = JobForm[id_type];

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
					var fld;
					var data = "{";
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
        // Save
        $scope.formSave = function() {
        	
			var fld, base, data = {}, data_project = {}, data_job = {};
            Rest.setUrl(defaultUrl);
            var data = processNewData(form.fields);
            console.log($scope);
            console.log($scope.name);
            
            console.log(data);
            Wait('start');
            Rest.post(data)
                .then(({data}) => {
                    base = $location.path().replace(/^\//, '').split('/')[0];
                    console.log(base);
                    /*if (base === 'ipam_infrastructure_jobs') {
                        $rootScope.flashMessage = i18n._('New Job successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "Job", data.id);
                        
                        $state.go('infraJobsList', null, { reload: true});
                    } else {
                        ReturnToCaller(1);
                    }*/ 
                    console.log('InfraJob Post succeed');
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new Job. POST returned status: ') + status });
                });
                
            //Project Saving
    		data_project.name = $scope.name;
    		data_project.description = "";
    		data_project.scm_type = "git";
    		data_project.scm_url = "https://github.com/dfederlein/ansible-demos.git";
    		data_project.scm_branch = "";
    		data_project.scm_clean = true;
    		data_project.scm_delete_on_update = true;
    		data_project.credential = null;
    		data_project.timeout = 0;
    		data_project.organization = 1;
    		data_project.scm_update_on_launch = true;
    		data_project.scm_update_cache_timeout = 0;

			console.log(data_project);

            //defaultprojectUrl = GetBasePath('projects');
			//url = (base === 'teams') ? GetBasePath('teams') + $stateParams.team_id + '/projects/' : defaultprojectUrl;
			//console.log(url);
            Rest.setUrl(GetBasePath('projects'));
            Rest.post(data_project)
                .then(({data_project}) => {
                    //$scope.addedItem = data_project.id;
                    //$state.go('projects.edit', { project_id: data_project.id }, { reload: true });
					console.log('Project Post succeed');
                })
                .catch(({data_project, status}) => {
                });
              
			//Job Saving
    		data_job.name = $scope.name;
			data_job.description = "";
			data_job.job_type = "run";
			data_job.inventory = 1;
			data_job.project = 4;
			data_job.playbook = "site.yml";
			data_job.credential = 1;
			data_job.vault_credential = null;
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
			data_job.become_enabled = true;
			data_job.diff_mode = true;
			data_job.allow_simultaneous = false;
			data_job.cloud_credential = null;
			data_job.network_credential = null;

			console.log(data_job);

            //defaultprojectUrl = GetBasePath('projects');
			//url = (base === 'teams') ? GetBasePath('teams') + $stateParams.team_id + '/projects/' : defaultprojectUrl;
			//console.log(url);
            Rest.setUrl(GetBasePath('job_templates'));
            Rest.post(data_job)
                .then(({data_job}) => {
                	console.log('Job Template Post succeed');
                    if (base === 'ipam_infrastructure_jobs') {
                        $rootScope.flashMessage = i18n._('New Job successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "Job", data.id);

                        $state.go('infraJobsList', null, { reload: true});
                    } else {
                        ReturnToCaller(1);
                    }
                })
                .catch(({data_job, status}) => {
                    Wait('stop');
                    ProcessErrors($scope, data_job, status, form, { hdr: i18n._('Error!'),
                        msg: i18n._('Failed to create new project. POST returned status: ') + status });
                });
               
        };

        $scope.formCancel = function() {
            $state.go('infraJobsList', null, { reload: true});
        };
    }
];
