/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', '$stateParams', 'HostForm', 'Rest',
    'ProcessErrors', 'GetBasePath', 'Wait', 'CreateSelect2',
    '$state', 'i18n','ParseTypeChange','ParseVariableString', 'ToJSON',
    function($scope, $rootScope, $stateParams, HostForm, Rest, ProcessErrors,
GetBasePath, Wait, CreateSelect2, $state, i18n, ParseTypeChange, ParseVariableString, ToJSON) {

        var form = HostForm,
            master = {},
            id = $stateParams.baremetal_id,
            defaultUrl = GetBasePath('ipam_bare_metals') + id;
        
        init();

        function init() {
        	$scope.select0 = 'is-selected';
			$scope.tabId = 0;
			
            Rest.setUrl(defaultUrl);
            Wait('start');
            Rest.get(defaultUrl).then(({data}) => {
            		
                    $scope.baremetal_id = id;
                    $scope.baremetal_obj = data;
					$scope.name =  data.name;
					$scope.description =  data.description;
					$scope.model = data.model;
					$scope.fqdn =  data.fqdn;
					$scope.sn =  data.sn;
					$scope.primary_ip = data.primary_ip;
					$scope.primary_ip6 = data.primary_ip6;
					$scope.primary_mac = data.primary_mac;
					$scope.primary_domain = data.primary_domain;
					var datacenter_value = data.datacenter;
					var credential_value = data.credential;

					//setScopeFields(data);
					$scope.opts = ParseVariableString(data.opts);

			        var datacenter_options = [];
					var datacenterLists = [];
			    	Rest.setUrl(GetBasePath('ipam_datacenters'));
			        Rest.get().then(({data}) => {
			        	datacenterLists = data.results;
			        	for (var i = 0; i < datacenterLists.length; i++) {
			        		datacenter_options.push({label:datacenterLists[i].name, value:datacenterLists[i].id});
			        	}
			        	$scope.datacenter_type_options = datacenter_options;
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
						console.log(credential_options.length);
						for (var i = 0; i < credential_options.length; i++) {
			                if (credential_options[i].value === credential_value) {
			                    $scope.credential = credential_options[i];
			                    break;
			                }
			            }

			        })
			    	.catch(({data, status}) => {
			        	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get datacenters. Get returned status: ') + status });
					});
					
		            CreateSelect2({
		                element: '#baremetal_datacenter',
		                multiple: false,
		            }); 

		            CreateSelect2({
		                element: '#baremetal_credential',
		                multiple: false,
		            });
					//Set SelectBox End
	
                    Wait('stop');
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, null, {
                        hdr: i18n._('Error!'),
                        msg: i18n.sprintf(i18n._('Failed to retrieve bare metal: %s. GET status: '), $stateParams.id) + status
                    });
                });

        }
        
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
            
            data.datacenter = $scope.datacenter.value;
    		data.credential = $scope.credential.value;
    		data.opts = $scope.opts;
            return data;
        };


		$scope.select = function(param)
		{
			$scope.tabId = param;
			if ($scope.tabId == 0) {
				$scope.select0 = "is-selected";
				$scope.select1 = "";
			}
			else if ($scope.tabId == 1) {
				$scope.select0 = "";
				$scope.select1 = "is-selected";
				//Set YAML/JSON Oots
				var callback = function() {
		            // Make sure the form controller knows there was a change
		            $scope[form.name + '_form'].$setDirty();
		        };
				

				$scope.parseTypeOpts = 'yaml';
		        ParseTypeChange({
		            scope: $scope,
		            field_id: 'opts',
		            variable: 'opts',
		            onChange: callback,
		            parse_variable: 'parseTypeOpts'
		        });
			}
			
		};

        $scope.formCancel = function() {
            $state.go('resourcePhysicalHostsList', null, { reload: true });
        };

        $scope.formSave = function() {
            $rootScope.flashMessage = null;
            if ($scope[form.name + '_form'].$valid) {
                Rest.setUrl(defaultUrl + '/');
                var data = processNewData(form.fields);
                Rest.put(data).then(() => {
                        $state.go($state.current, null, { reload: true });
                    })
                    .catch(({data, status}) => {
                        ProcessErrors($scope, data, status, null, {
                            hdr: i18n._('Error!'),
                            msg: i18n.sprintf(i18n._('Failed to retrieve bare metal: %s. GET status: '), $stateParams.id) + status
                        });
                    });
            }
        };
    }
];
