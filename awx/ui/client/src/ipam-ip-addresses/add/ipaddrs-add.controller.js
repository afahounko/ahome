/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

const status_type_options = [
	{value:1, label:'Active'}, 
	{value:2, label:'Reserved'}, 
	{value:3, label:'Deprecated'}, 
	{value:5, label: 'DHCP'}
];

export default ['$scope', '$rootScope', 'IPAddrForm', 'GenerateForm', 'Rest',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n', 'ParseTypeChange', 'ToJSON',
    function($scope, $rootScope, IPAddrForm, GenerateForm, Rest, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2,
	$state, $location, i18n, ParseTypeChange, ToJSON) {

        var defaultUrl = GetBasePath('ipam_ip_addresses'),
            form = IPAddrForm;

        init();

        function init() {
			$scope.select0 = 'is-selected';
			$scope.tabId = 0;
			
        	var datacenter_options = [];
        	Rest.setUrl(GetBasePath('ipam_datacenters'));
	        Rest.get().then(({data}) => {
	        	var datacenterLists = data.results;
	        	for (var i = 0; i < datacenterLists.length; i++)
	        		datacenter_options.push({label:datacenterLists[i].name, value:datacenterLists[i].id});
	        	$scope.datacenter_type_options = datacenter_options;
	        })
        	.catch(({data, status}) => {
            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get datacenters. Get returned status: ') + status });
			});
        	
			var vrf_options = [];
			Rest.setUrl(GetBasePath('ipam_vrfs'));
	        Rest.get().then(({data}) => {
	        	var vrfsLists = data.results;
	        	for (var i = 0; i < vrfsLists.length; i++)
	        		vrf_options.push({label:vrfsLists[i].name, value:vrfsLists[i].id});
	        	$scope.vrf_type_options = vrf_options;
	        })
        	.catch(({data, status}) => {
            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get vrfs. Get returned status: ') + status });
			});
			
			$scope.status_type_options = status_type_options;
			$scope.status = status_type_options[0];
            CreateSelect2({
                element: '#ipaddr_datacenter',
                multiple: false,
            });
            CreateSelect2({
                element: '#ipaddr_vrf',
                multiple: false,
            });
            CreateSelect2({
                element: '#ipaddr_status',
                multiple: false,
            });
            // apply form definition's default field values
            GenerateForm.applyDefaults(form, $scope);
        }

        // Save
        $scope.formSave = function() {
            var fld, data = {};

            Rest.setUrl(defaultUrl);
            for (fld in form.fields) {
                if (form.fields[fld].realName) {
                    data[form.fields[fld].realName] = $scope[fld];
                } else {
                    data[fld] = $scope[fld];
                }
            }
            
            data.datacenter = $scope.datacenter.value;
            if($scope.vrf != null) data.vrf = $scope.vrf.value;
            data.status = $scope.status.value;

            Wait('start');
            Rest.post(data)
                .then(({data}) => {
                    var base = $location.path().replace(/^\//, '').split('/')[0];
                    if (base === 'ipam_ip_addresses') {
                        $rootScope.flashMessage = i18n._('New IP address successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "IP address", data.id);
                        $state.go('ipamIpAddressesList.edit', { ipaddr_id: data.id }, { reload: true });
                    } else {
                        ReturnToCaller(1);
                    }
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new IP address. POST returned status: ') + status });
                });
        };

        $scope.formCancel = function() {
            $state.go('ipamIpAddressesList');
        };
    }
];
