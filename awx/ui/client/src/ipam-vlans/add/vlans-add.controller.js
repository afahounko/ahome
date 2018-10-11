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
];

export default ['$scope', '$rootScope', 'VLanForm', 'GenerateForm', 'Rest',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n', 'ParseTypeChange', 'ToJSON',
    function($scope, $rootScope, VLanForm, GenerateForm, Rest, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2,
	$state, $location, i18n, ParseTypeChange, ToJSON) {

        var defaultUrl = GetBasePath('ipam_vlans'),
            form = VLanForm;

        init();

        function init() {
			
        	var datacenter_options = [];
        	Rest.setUrl(GetBasePath('ipam_datacenters'));
	        Rest.get().then(({data}) => {
	        	var datacenterLists = data.results;
	        	for (var i = 0; i < datacenterLists.length; i++)
	        		datacenter_options.push({label:datacenterLists[i].name, value:datacenterLists[i].id});
	        	$scope.datacenter_type_options = datacenter_options;
	        })
        	.catch(({data, status}) => {
            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get Datacenters. Get returned status: ') + status });
			});
        	
			$scope.status_type_options = status_type_options;
			$scope.status = status_type_options[0];
            CreateSelect2({
                element: '#vlan_datacenter',
                multiple: false,
            });
            CreateSelect2({
                element: '#vlan_status',
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
            data.status = $scope.status.value;

            Wait('start');
            Rest.post(data)
                .then(({data}) => {
                    var base = $location.path().replace(/^\//, '').split('/')[0];
                    if (base === 'ipam_vlans') {
                        $rootScope.flashMessage = i18n._('New VLan successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "VLan", data.id);
                        $state.go('ipamVlansList.edit', { vlan_id: data.id }, { reload: true });
                    } else {
                        ReturnToCaller(1);
                    }
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new VLan. POST returned status: ') + status });
                });
        };

        $scope.formCancel = function() {
            $state.go('ipamVlansList');
        };
    }
];
