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

export default ['$window', '$scope', '$rootScope', '$stateParams', 'ProviderForm', 'GenerateForm', 'Rest','ParseTypeChange',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath', 'SaveProvider', 
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n','ParseVariableString', '$q',
    function($window, $scope, $rootScope, $stateParams, ProviderForm, GenerateForm, Rest, ParseTypeChange, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, SaveProvider, Wait, CreateSelect2, 
	$state, $location, i18n, ParseVariableString, $q) {

        var defaultUrl = GetBasePath('ipam_providers'),
        	id_type = $window.localStorage.getItem('form_id'),
            form = ProviderForm[id_type];

        init();

        function init() {
            // apply form definition's default field values
			console.log("Add FORM Init");
			console.log(id_type);
			console.log(form);
            GenerateForm.applyDefaults(form, $scope);

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
	        
			$scope.cloud = form.cloud;
			/*if(id_type == "vmware_vcenter")
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
				        
				        if(localexist == true)
				        {
				        	$scope.inventory_hosts = localres;
				        }
				        else
				        {
				        	//If 'localhost' not exist, we must create a new Host named localhost
				        	//For now i will skip this
				        	//2018/11/5
				    		var localhost_data = {};
				    		localhost_data.name = "localhost";
				    		localhost_data.variables = "ansible_connection: local";
				    		localhost_data.enabled = true;
				        	Rest.setUrl(GetBasePath('hosts'));
		        			Rest.post(localhost_data).then(({data}) => {
		        				localres.push(data);
		        				$scope.inventory_hosts = localres;
		        			});
				        }
				    }
				    else  // if cloud = false
				    {
				    	
				    }
		        });
            
        	}*/

			// change to modal dialog
            var element = document.getElementById("modaldlg");
            element.style.display = "block";
            var panel = element.getElementsByClassName("Panel ng-scope");
            panel[0].classList.add("modal-dialog");
            panel[0].style.width = "60%";

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
	            element: '#' + id_type + '_ipaddress',
	            multiple: false,
	        }); 
        };

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
				 
				if($scope.tabId < 4)
				{
					$scope.tabId = $scope.tabId + 1;
				}
				if($scope.tabId == 1)
				{
					$scope.opts = "---";
				}
				if((form.steps && $scope.tabId == form.steps) || (!form.steps && $scope.tabId == 3))
				{
					var fld, subid;
					var data = "{";
					for (fld in form.fields) {
						console.log($scope[fld]);
						if(fld == "datacenter" || fld == "credential" || fld == "ipaddress")
						{
							data += "'" + fld + "':";
			            	if($scope[fld] != undefined) data += "'" + $scope[fld].value + "'";
			            	else data += "''";
			            	data += ",\n"; 
			            	continue;
						}
						if(fld == "inventory_hosts" || fld == "instance_groups")
						{
							data += "'" + fld + "':";
							if($scope[fld] != undefined)
							{
								data += "'"
								for(subid in $scope[fld]){
									data += $scope[fld][subid].id + ',';
								}
								data = data.substring(0, data.length-1);
								data += "',"; 
							}
							else data += "'',";
							data+= "\n";
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
		            data += "'id_type':'" + id_type + "'\n";
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
				$scope.status4 = "";
				$scope.status5 = "";
			}
			else if ($scope.tabId == 2) {
				$scope.status1 = "complete";
				$scope.status2 = "active";
				$scope.status3 = "";
				$scope.status4 = "";
				$scope.status5 = "";
			}
			else if ($scope.tabId == 3) {
				$scope.status1 = "complete";
				$scope.status2 = "complete";
				$scope.status3 = "active";
				$scope.status4 = "";
				$scope.status5 = "";
			}
			else if ($scope.tabId == 4) {
				$scope.status1 = "complete";
				$scope.status2 = "complete";
				$scope.status3 = "complete";
				$scope.status4 = "active";
				$scope.status5 = "";
				console.log('scope is ');
				console.log($scope);
				
			}
			else if ($scope.tabId == 5) {
				$scope.status1 = "complete";
				$scope.status2 = "complete";
				$scope.status3 = "complete";
				$scope.status4 = "complete";
				$scope.status5 = "active";
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
			if($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if($scope.credential != null) data.credential = $scope.credential.value;
    		data.opts = $scope.opts;
    		
            return data;
        };
        // prepares a data payload for a PUT request to the API
        var processExtras = function (option) {
            var fld, subid;
            var data = "{";
            console.log($scope);
            for (fld in option) {
                data += "'ahome_" + fld + "':";
                if (option[fld] != undefined) data += "'" + option[fld] + "'";
                else data += "''";
                data += ",\n";
            }
            data += "'extra_vars':''\n";
            data += "}";

            return data;
        };
        // Save
        $scope.formSave = function() {
        	console.log(form);
        	var data_subitem = processNewData(form.fields);
        	console.log(data_subitem);
        	SaveProvider(defaultUrl, form, data_subitem);
        };

        $scope.formCancel = function() {
            $state.go('infraProvidersList');
        };
    }
];
