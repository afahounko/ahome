/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$stateParams', '$timeout', 'ProviderForm', 'GenerateForm', 'Rest','ParseTypeChange',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n','ParseVariableString', 'initSelect', 
    function($window, $scope, $rootScope, $stateParams, $timeout, ProviderForm, GenerateForm, Rest, ParseTypeChange, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2, 
	$state, $location, i18n, ParseVariableString, initSelect) {

        var master = {}, boxes, box, variable, 
            id = $stateParams.provider_id,
        	fk_type = $window.localStorage.getItem('form_id'),
            form = ProviderForm[fk_type],
            defaultUrl = GetBasePath('ipam_providers') + id;
        var credential_id, inventory_id, host_id, project_id, template_id, poweroff_id, remove_id;
        console.log($stateParams);
        init();

        function init() {
        	
            Rest.setUrl(defaultUrl);
            Wait('start');
            Rest.get(defaultUrl).then(({data}) => {
				var itm;
                $scope.provider_id = id;
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
				if(!form.cloud && form.fields.kind){
					$scope.kind_type_options = initSelect('', form.fields.kind.ngValues, form.fields.kind.ngFilter ? form.fields.kind.ngFilter : "");
					if(form.credential_type == 'BuildFactory' || form.credential_type == 'Linux'){	//credential_type is machine
						$scope.kind = $scope.kind_type_options[0];
					}
					else		//credential_type is custom (need to create a new credential_type with customized form)
					{
						$scope.kind = $scope.kind_type_options[1];
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

		        if(form.fields.datacenter){
		        	$scope.datacenter_type_options = initSelect('ipam_datacenters', form.fields.datacenter.ngFilter ? form.fields.datacenter.ngFilter : "");
		        	$timeout(function(){
						for(var fld in $scope.datacenter_type_options)
						{
							if($scope.datacenter_type_options[fld].value == data.opts.datacenter)
								$scope.datacenter = $scope.datacenter_type_options[fld];
						}
					},2000);
		        }

		        if(form.fields.ipaddress){
	        		$scope.ipaddress_type_options = initSelect('ipam_ip_addresses', form.fields.ipaddress.ngFilter ? form.fields.ipaddress.ngFilter : "");
					$timeout(function(){
						for(var fld in $scope.ipaddress_type_options)
						{
							if($scope.ipaddress_type_options[fld].value == data.opts.ipaddress)
								$scope.ipaddress = $scope.ipaddress_type_options[fld];
						}
					},2000);
	        		
	        	}

	        	if(form.fields.credential){
	        		$scope.credential_type_options = initSelect('credentials', form.fields.credential.ngFilter ? form.fields.credential.ngFilter : "");
		        	$timeout(function(){
						for(var fld in $scope.credential_type_options)
						{
							if($scope.credential_type_options[fld].value == data.opts.credentials)
								$scope.credentials = $scope.credential_type_options[fld];
						}
					},2000);
	        	}
		        CreateSelect2({
		            element: '#' + fk_type + '_datacenter',
		            multiple: false,
		        }); 
		        CreateSelect2({
		            element: '#' + fk_type + '_ipaddress',
		            multiple: false,
		        }); 
		        CreateSelect2({
		            element: '#' + fk_type + '_credential',
		            multiple: false,
		        });

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
                    msg: i18n.sprintf(i18n._('Failed to retrieve Provider: %s. GET status: '), $stateParams.id) + status
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
				if($scope.tabId == 4)
				{
					var fld, subid;
					var data = "{";
					if(inventory_id != undefined) data += "'inventory_id':'" + inventory_id + "',\n";
					if(credential_id != undefined) data += "'credential_id':'" + credential_id + "',\n";
					if(host_id != undefined) data += "'host_id':'" + host_id + "',\n";
					if(project_id != undefined) data += "'project_id':'" + project_id + "',\n";
					if(template_id != undefined) data += "'template_id':'" + template_id + "',\n";
					if(poweroff_id != undefined) data += "'poweroff_id':'" + poweroff_id + "',\n";
					if(remove_id != undefined) data += "'remove_id':'" + remove_id + "',\n";
	                
					for (fld in form.fields) {
						
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
		            data += "'fk_type':'" + fk_type + "'\n";
		        	data += "}";
		            $scope.opts = ParseVariableString(data);
					$scope.parseTypeOpts = 'yaml';
					console.log(form);
			        ParseTypeChange({
			            scope: $scope,
			            field_id: fk_type + '_opts',
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
			}
			else if ($scope.tabId == 5) {
				$scope.status1 = "complete";
				$scope.status2 = "complete";
				$scope.status3 = "complete";
				$scope.status4 = "complete";
				$scope.status5 = "active";
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
            $state.go('infraProvidersList', null, { reload: true });
        };

        $scope.formSave = function() {
        	console.log("Update");
            $rootScope.flashMessage = null;
            
            Rest.setUrl(defaultUrl + '/');
            var data = processNewData(form.fields);
            console.log(data);
            Rest.put(data).then(() => {
                    //$state.go($state.current, null, { reload: true });
                    $state.go('infraProvidersList', null, { reload: true });
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
