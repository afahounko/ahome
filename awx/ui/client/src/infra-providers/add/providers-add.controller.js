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
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath', 'SaveInfraItem', 'DeleteSubJobTemplate', 'checkExistApi' ,
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n','ParseVariableString', '$q', 'initSelect', 'cloudProcess',
    function($window, $scope, $rootScope, $stateParams, ProviderForm, GenerateForm, Rest, ParseTypeChange, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, SaveInfraItem, DeleteSubJobTemplate, checkExistApi, Wait, CreateSelect2, 
	$state, $location, i18n, ParseVariableString, $q, initSelect, cloudProcess) {

        var defaultUrl = GetBasePath('ipam_providers'),
        	fk_type = $window.localStorage.getItem('form_id'),
            form = ProviderForm[fk_type];

        init();

        function init() {
            // apply form definition's default field values
			console.log("Add FORM Init");
			console.log(form);
            GenerateForm.applyDefaults(form, $scope);

            $scope.isAddForm = true;

			$scope.status1 = "active";
            $scope.tabId = 1;
			$scope.previous = "CLOSE";
			$scope.next = "NEXT";
			$scope.cloud = form.cloud;

			if(!form.cloud && form.fields.kind){
				$scope.kind_type_options = initSelect('', form.fields.kind.ngValues, form.fields.kind.ngFilter ? form.fields.kind.ngFilter : "");
				if(form.credential_type == 'BuildFactory' || form.credential_type == 'Linux'){	//credential_type is machine
					$scope.kind = $scope.kind_type_options[0];
				}
				else		//credential_type is custom (need to create a new credential_type with customized form)
				{
					$scope.kind = $scope.kind_type_options[1];
				}
				CreateSelect2({
			            element: '#' + fk_type + '_kind',
			            multiple: false,
			    });
			}
			//$scope.kind = cloudProcess(form);
			//Init SelectBoxes
			for(var field in form.fields)
			{
				console.log(field);
				if(field.startsWith("select"))
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

			if(fk_type == "vmware_vcenter")
			{
				Rest.setUrl(GetBasePath('hosts'));
		        Rest.get().then(({data}) => {
		        	console.log(data);
		        	console.log(form);
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
            
        	}

			// change to modal dialog
            var element = document.getElementById("modaldlg");
            element.style.display = "block";
            var panel = element.getElementsByClassName("Panel ng-scope");
            panel[0].classList.add("modal-dialog");
            panel[0].style.width = "60%";

        }
		$scope.kindChange = function(){
			console.log($scope.select_kind.value);
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
					console.log('Datas for the fields');
					var fld, subid;
					var data = "{";
					for (fld in form.fields) {
						console.log(fld);
						console.log($scope[fld]);
						if(fld.startsWith('select_'))
						{
							data += "'" + fld + "':";
							if(form.fields[fld].opt)
							{
								if($scope[fld] != undefined) data += "'" + $scope[fld].label + "'";
			            		else data += "''";
				            }
				            else
				            {
				            	if($scope[fld] != undefined) data += "'" + $scope[fld].value + "'";
				            	else data += "''";
				            }
			            	data += ",\n"; 
			            	continue;
						}
						if(fld == 'kind')
						{
							data += "'" + fld + "':";
							if($scope[fld] != undefined) data += "'" + $scope[fld].label + "'";
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
		            data += "'fk_model':'providers',\n";
		            data += "'fk_type':'" + fk_type + "'\n";
		        	data += "}";
		        	console.log(data);
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
            if($scope.select_kind != null) data.select_kind = $scope.select_kind.value;
			if($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if($scope.credential != null) data.credential = $scope.credential.value;
    		data.opts = $scope.opts;
            return data;
        };
        // Save
        function deleteProvider(id, _callback){
        	DeleteSubJobTemplate(defaultUrl, id, '', 0);
        	_callback();
        }
        $scope.formSave = function() {
        	var data_item = processNewData(form.fields);
        	SaveInfraItem(defaultUrl, form, data_item, 'infraProvidersList');
        };

        $scope.formCancel = function() {
            $state.go('infraProvidersList');
        };
    }
];
