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

export default ['$scope', '$rootScope', 'PrefixForm', 'GenerateForm', 'Rest',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n',
    function($scope, $rootScope, PrefixForm, GenerateForm, Rest, Alert,
	ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2, $state, $location, i18n) {

        var defaultUrl = GetBasePath('ipam_prefixes'),
            form = PrefixForm;

        init();

        function init() {
            // apply form definition's default field values
            GenerateForm.applyDefaults(form, $scope);
			Wait('start');
			
        	var datacenter_options = [];
        	Rest.setUrl(GetBasePath('ipam_datacenters'));
	        Rest.get().then(({data}) => {
	        	var datacenterLists = data.results;
	        	for (var i = 0; i < datacenterLists.length; i++)
	        		datacenter_options.push({label:datacenterLists[i].name, value:datacenterLists[i].id});
	        	$scope.datacenter_type_options = datacenter_options;
	        	$scope.datacenter = null;
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
	        	$scope.vrf = null;
	        })
        	.catch(({data, status}) => {
            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get datacenters. Get returned status: ') + status });
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
	        	$scope.vlan = null;
	        })
        	.catch(({data, status}) => {
            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get datacenters. Get returned status: ') + status });
			});
        	
        	CreateSelect2({
                element: '#prefix_vlan',
                multiple: false,
            });

			$scope.status_type_options = status_options;
			$scope.status = status_options[0];
			CreateSelect2({
                element: '#prefix_status',
                multiple: false,
            });

			Wait('stop');
            $scope.isAddForm = true;
        }

        $scope.toggleForm = function(key) {
            $scope[key] = !$scope[key];
        };
        // Save
        $scope.formSave = function() {
            var fld, data = {};

			data.prefix = $scope.prefix;
			data.description = $scope.description;
			data.is_pool = $scope.is_pool;
			
            if($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if($scope.vrf != null) data.vrf = $scope.vrf.value;
            if($scope.vlan != null) data.vlan = $scope.vlan.value;
            data.status = $scope.status.value;
            
            Wait('start');
            Rest.setUrl(defaultUrl);
            Rest.post(data)
                .then(({data}) => {
                    var base = $location.path().replace(/^\//, '').split('/')[0];
                    if (base === 'ipam_prefixes') {
                        $rootScope.flashMessage = i18n._('New Prefix successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "prefix", data.id);
                        $state.go('ipamPrefixesList.edit', { prefix_id: data.id }, { reload: true });
                    } else {
                        ReturnToCaller(1);
                    }
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new Prefix. POST returned status: ') + status });
                });
        };

        $scope.formCancel = function() {
            $state.go('ipamPrefixesList');
        };
    }
];
