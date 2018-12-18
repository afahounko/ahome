/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$stateParams', '$timeout', 'SecurityForm', 'GenerateForm', 'Rest','ParseTypeChange',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n','ParseVariableString', 'initSelect', 'SetActiveWizard', 'GetOptsValues',
    function($window, $scope, $rootScope, $stateParams, $timeout, SecurityForm, GenerateForm, Rest, ParseTypeChange, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2, 
	$state, $location, i18n, ParseVariableString, initSelect, SetActiveWizard, GetOptsValues) {

        var master = {}, boxes, box, variable, 
            id = $stateParams.security_id,
        	fk_type = $window.localStorage.getItem('form_id'),
            form = SecurityForm[fk_type],
            defaultUrl = GetBasePath('ipam_securities') + id;
        var prev_opts = [], credential_id, inventory_id, host_id, project_id, template_id, poweroff_id, remove_id;
        console.log($stateParams);
        init();

        function init() {
        	
            Rest.setUrl(defaultUrl);
            Wait('start');
            Rest.get(defaultUrl).then(({data}) => {
				var itm;
                $scope.security_id = id;
		        $scope.tabId = 1;
                $scope.status1 = "active";
                prev_opts = data.opts; 

                for (itm in data.opts)
                {
                	if(data.opts[itm] !== '$Encrypted$') $scope[itm] = data.opts[itm];
                	if(data.opts[itm] === 'true')
                	{
                		$scope[itm] = true;
                	}
                	else if(data.opts[itm] === 'false')
                	{
                		$scope[itm] = false;
                	}
                }

                credential_id = data.opts.credential_id;  //edited 2018/11/6 for credential which created when adding
                inventory_id = data.opts.inventory_id;  //edited 2018/11/6 for inventory which created when adding
                host_id = data.opts.host_id;  //edited 2018/11/6 for host which created when adding
                project_id = data.opts.project_id;
                template_id = data.opts.template_id;
                poweroff_id = data.opts.poweroff_id;
                remove_id = data.opts.remove_id;
                
                fk_type = data.opts.fk_type;
                console.log("FK_TYPE " + fk_type);

				//setScopeFields(data);
				//Set YAML/JSON Oots
				var callback = function() {
		            // Make sure the form controller knows there was a change
		            $scope[form.name + '_form'].$setDirty();
		        };

			    for(var field in form.fields)
				{
					console.log(field);
					if(form.fields[field].type == 'select')
					{
						if(form.fields[field].ngValues)
						{
							$scope[field + '_type_options'] = initSelect('', form.fields[field].ngValues, form.fields[field].ngFilter ? form.fields[field].ngFilter : "");
						}
						else
						{
							if(form.fields[field].ngSource)
								$scope[field + '_type_options'] = initSelect(form.fields[field].ngSource, '', form.fields[field].ngFilter ? form.fields[field].ngFilter : "");
						}
						var elmnt = '#' + fk_type + '_' + field;
						CreateSelect2({
				            element: elmnt,
				            multiple: false,
				        });
					}
					if(form.fields[field].type == 'toggleSwitch')
					{
						if(form.fields[field].default != undefined) $scope[field] = form.fields[field].default;
					}
				}
	        	//Set Default Value
		        $timeout(function(){
		        	for(var field in form.fields)
					{
						if(form.fields[field].type == 'select')
						{
							for(var fld in $scope[field + '_type_options'])
							{
								if(form.fields[field].opt)
								{
									if($scope[field + '_type_options'][fld].label == data.opts[field])
										$scope[field] = $scope[field + '_type_options'][fld];
					            }
					            else
					            {
					            	if($scope[field + '_type_options'][fld].value == data.opts[field])
										$scope[field] = $scope[field + '_type_options'][fld];
					            }
							}
						}
					}
				},2000);
                //Get Host variable from Controller
                
                var inventory_hosts = data.opts.inventory_hosts;
				$scope.cloud = form.cloud;
				if(fk_type == "vmware_vcenter")
				{
					Rest.setUrl(GetBasePath('hosts'));
			        Rest.get().then(({data}) => {
			        	var hostLists = data.results;
			        	var localexist = false;
			        	if(form.cloud)	//if cloud = true
			        	{
			        		var localres = [];
				        	for (var i = 0; i < hostLists.length; i++)
				        	{
					        	if(hostLists[i].name == "localhost"){
					        		console.log("localhost Exist");
					        		localres.push(hostLists[i]);
					        		localexist = true;
					        	}
					        }
					        $scope.inventory_hosts = localres;
					        if(localexist == false)
					        {
					        	//If 'localhost' not exist, we must create a new Host named localhost
					        	//For now i will skip this
					        	//2018/11/5
					        }
					    }
					    else  // if cloud = false
					    {
					    	var localres = [];
				        	for (var i = 0; i < hostLists.length; i++)
				        	{
								var host_ids = {};
				                host_ids = inventory_hosts.split(',');
				                console.log(host_ids);
				                for (var j = 0; j < host_ids.length; j++) {
				                    if(hostLists[i].id == parseInt(host_ids[j])){
						        		console.log("Match Found");
						        		localres.push(hostLists[i]);
						        	}
				                }
					        }
					        $scope.inventory_hosts = localres;
					    }
			        });
	        	}
            })
            .catch(({data, status}) => {
                ProcessErrors($scope, data, status, null, {
                    hdr: i18n._('Error!'),
                    msg: i18n.sprintf(i18n._('Failed to retrieve Security: %s. GET status: '), $stateParams.id) + status
                });
            });
            // change to modal dialog
            var element = document.getElementById("modaldlg");
            element.style.display = "block";
            var panel = element.getElementsByClassName("Panel ng-scope");
            panel[0].classList.add("modal-dialog");
            panel[0].style.width = "60%";
            
            Wait('stop');
        }
        

        $scope.datacenterChange = function() {
            // When an scm_type is set, path is not required
            console.log($scope.datacenter);
	        var ipaddress_options = [];
			var ipaddressLists = [];
	    	Rest.setUrl(GetBasePath('ipam_ip_addresses'));
	        Rest.get().then(({data}) => {
	        	ipaddressLists = data.results;
	        	for (var i = 0; i < ipaddressLists.length; i++) {
	        		console.log(ipaddressLists[i].address);
	        		if(ipaddressLists[i].datacenter === $scope.datacenter.value)
	        		{
	        			ipaddress_options.push({label:ipaddressLists[i].address, value:ipaddressLists[i].id});
	        		}
	        	}
	        	$scope.ipaddress_type_options = ipaddress_options;l
	            for (var i = 0; i < ipaddress_options.length; i++) {
	                if (ipaddress_options[i].value === ipaddress_value) {
	                    $scope.ipaddress = ipaddress_options[i];
	                    break;
	                }
	            }
	        })
	    	.catch(({data, status}) => {
	        	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get IpAddress. Get returned status: ') + status });
			});
			
			CreateSelect2({
	            element: '#' + fk_type + '_ipaddress',
	            multiple: false,
	        }); 
        };

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
				if($scope.tabId > 1){
					$scope.tabId = $scope.tabId - 1;
				}
			}
			else if (clickID == 2) {
				if($scope.tabId == 1){
					$scope.opts = "---";
				}
				if((form.steps && $scope.tabId < form.steps) || (!form.steps && $scope.tabId < 3)){
					$scope.tabId = $scope.tabId + 1;
				}
				if((form.steps && $scope.tabId == form.steps) || (!form.steps && $scope.tabId == 3)){
					var data = GetOptsValues($scope, form, 'securities', fk_type, prev_opts);
		            $scope.opts = ParseVariableString(data);
					$scope.parseTypeOpts = 'yaml';
			        ParseTypeChange({
			            scope: $scope,
			            field_id: fk_type + '_opts',
			            variable: 'opts',
			            onChange: callback,
			            parse_variable: 'parseTypeOpts'
			        });
				}
			}
			$scope = SetActiveWizard($scope, $scope.tabId);
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
    		var inputs = {};
            _.forEach(fields, function(value, key) {
                if ($scope[key] !== '' && $scope[key] !== null && $scope[key] !== undefined) {
                    data[key] = $scope[key];
                    if(key.startsWith('credential_'))
                    {
                    	inputs[key.substring(11)] = $scope[key];
                    }
                }
            });
            console.log(inputs);
            data.inputs = inputs;
            if($scope.kind != null) data.kind = $scope.kind.value;
			if($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if($scope.credential != null) data.credential = $scope.credential.value;
    		data.opts = $scope.opts;
            return data;
        };

        $scope.formCancel = function() {
            $state.go('infraSecurityList', null, { reload: true });
        };

        $scope.formSave = function() {
        	console.log("Update");
            $rootScope.flashMessage = null;
            
            Rest.setUrl(defaultUrl + '/');
            var data = processNewData(form.fields);
            console.log(data);
            Rest.put(data).then(() => {
                    //$state.go($state.current, null, { reload: true });
                    $state.go('infraSecurityList', null, { reload: true });
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, null, {
                        hdr: i18n._('Error!'),
                        msg: i18n.sprintf(i18n._('Failed to retrieve Ipam: %s. GET status: '), $stateParams.id) + status
                    });
                });
        };
		$scope.lookupCredential = function(){
            // Perform a lookup on the credential_type. Git, Mercurial, and Subversion
            // all use SCM as their credential type.
            let credType = _.filter(CredentialTypes, function(credType){
                return ($scope.scm_type.value !== "insights" && credType.kind === "scm" ||
                    $scope.scm_type.value === "insights" && credType.kind === "insights");
            });
            $state.go('.credential', {
                credential_search: {
                    credential_type: credType[0].id,
                    page_size: '5',
                    page: '1'
                }
            });
        };
    }
];
