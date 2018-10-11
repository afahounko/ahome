/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

const status_options = [
	{value:0, label:'Container'}, 
	{value:1, label:'Active'}, 
	{value:2, label:'Reserved'}, 
	{value:3, label: 'Deprecated'}
];

export default ['$scope', '$rootScope', '$stateParams', 'PrefixForm', 'Rest',
    'ProcessErrors', 'GetBasePath', 'Wait', 'CreateSelect2', '$state', 'i18n',
    function($scope, $rootScope, $stateParams, PrefixForm, Rest, ProcessErrors,
    GetBasePath, Wait, CreateSelect2, $state, i18n) {

        var form = PrefixForm,
            master = {},
            id = $stateParams.prefix_id,
            defaultUrl = GetBasePath('ipam_prefixes') + id;
        
        init();

        function init() {
            Rest.setUrl(defaultUrl);
            Wait('start');
            Rest.get(defaultUrl).then(({data}) => {
            		
                    $scope.prefix_id = id;
                    $scope.prefix_obj = data;
                    
                    $scope.prefix = data.prefix;
					$scope.description = data.description;
					$scope.is_pool = data.is_pool;
					
					var datacenter_value = data.datacenter;
					var vrf_value = data.vrf;
					var vlan_value = data.vlan;
					var status_value = data.status;
					


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
					
					CreateSelect2({
		                element: '#prefix_datacenter',
		                multiple: false,
		            }); 

		        	var vrf_options = [];
		        	Rest.setUrl(GetBasePath('ipam_vrfs'));
			        Rest.get().then(({data}) => {
			        	var vrfLists = data.results;
			        	for (var i = 0; i < vrfLists.length; i++)
			        		vrf_options.push({label:vrfLists[i].name, value:vrfLists[i].id});
			        	$scope.vrf_type_options = vrf_options;
			            for (var i = 0; i < vrf_options.length; i++) {
			                if (vrf_options[i].value === vrf_value) {
			                    $scope.vrf = vrf_options[i];
			                    break;
			                }
			            }
			        })
		        	.catch(({data, status}) => {
		            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get VRF. Get returned status: ') + status });
					});
		        	
		        	CreateSelect2({
		                element: '#prefix_vrf',
		                multiple: false,
		            });

		        	var vlan_options = [];
		        	Rest.setUrl(GetBasePath('ipam_vlans'));
			        Rest.get().then(({data}) => {
			        	var vlanLists = data.results;
			        	for (var i = 0; i < vlanLists.length; i++)
			        		vlan_options.push({label:vlanLists[i].name, value:vlanLists[i].id});
			        	$scope.vlan_type_options = vlan_options;
			            for (var i = 0; i < vlan_options.length; i++) {
			                if (vlan_options[i].value === vlan_value) {
			                    $scope.vlan = vlan_options[i];
			                    break;
			                }
			            }
			        })
		        	.catch(({data, status}) => {
		            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get VLan. Get returned status: ') + status });
					});
		        	
		        	CreateSelect2({
		                element: '#prefix_vlan',
		                multiple: false,
		            });
		            	

					$scope.status_type_options = status_options;
					$scope.status = status_options[0];
					for (var i = 0; i < status_options.length; i++) {
		                if (status_options[i].value === status_value) {
		                    $scope.status = status_options[i];
		                    break;
		                }
		            }
					CreateSelect2({
		                element: '#prefix_status',
		                multiple: false,
		            });

                    Wait('stop');
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, null, {
                        hdr: i18n._('Error!'),
                        msg: i18n.sprintf(i18n._('Failed to retrieve Prefix: %s. GET status: '), $stateParams.id) + status
                    });
                });
        }
    
        $scope.toggleForm = function(key) {
            $scope[key] = !$scope[key];
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
            if($scope.vrf != null) data.vrf = $scope.vrf.value;
            if($scope.vlan != null) data.vlan = $scope.vlan.value;
            data.status = $scope.status.value;
            return data;
        };

        $scope.formCancel = function() {
            $state.go('ipamPrefixesList', null, { reload: true });
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
                            msg: i18n.sprintf(i18n._('Failed to retrieve Prefix: %s. GET status: '), $stateParams.id) + status
                        });
                    });
            }
        };
    }
];
