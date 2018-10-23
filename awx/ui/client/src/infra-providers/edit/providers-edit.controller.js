/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', '$stateParams', 'ProviderForm', 'GenerateForm', 'Rest','ParseTypeChange',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n','ParseVariableString',
    function($window, $scope, $rootScope, $stateParams, ProviderForm, GenerateForm, Rest, ParseTypeChange, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2, 
    $state, $location, i18n, ParseVariableString) {

        var master = {}, boxes, box, variable, 
            id = $stateParams.provider_id,
        	id_type = $window.localStorage.getItem('form_id'),
            form = ProviderForm[id_type],
            defaultUrl = GetBasePath('ipam_providers') + id;
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
                var datacenter_value = data.opts.datacenter;
                var ipaddress_value = data.opts.ipaddress;
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

		        var ipaddress_options = [];
				var ipaddressLists = [];
		    	Rest.setUrl(GetBasePath('ipam_ip_addresses'));
		        Rest.get().then(({data}) => {
		        	console.log(ipaddress_value);
		        	ipaddressLists = data.results;
		        	for (var i = 0; i < ipaddressLists.length; i++) {
		        		ipaddress_options.push({label:ipaddressLists[i].address, value:ipaddressLists[i].id});
		        	}
		        	$scope.ipaddress_type_options = ipaddress_options;
		            for (var i = 0; i < ipaddress_options.length; i++) {
		            	console.log(''+ipaddress_options[i].value);
		                if ((''+ipaddress_options[i].value) === ipaddress_value) {
		                    $scope.ipaddress = ipaddress_options[i];
		                    break;
		                }
		            }
		            if(ipaddress_value == "") $scope.ipaddress = null;
		        })
		    	.catch(({data, status}) => {
		        	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get ipaddress. Get returned status: ') + status });
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
		            element: '#' + id_type + '_ipaddress',
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
	            element: '#' + id_type + '_ipaddress',
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
					var fld;
					var data = "{";
					for (fld in form.fields) {
						
						if(fld == "datacenter" || fld == "credential" || fld == "ipaddress")
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
		            data += "'id_type':'" + id_type + "'\n";
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
