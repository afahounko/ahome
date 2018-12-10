/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', 'VrfForm', 'GenerateForm', 'Rest',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n',
    function($scope, $rootScope, VrfForm, GenerateForm, Rest, Alert,
	ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2, $state, $location, i18n) {

        var defaultUrl = GetBasePath('ipam_vrfs'),
            form = VrfForm;

        init();

        function init() {
            // apply form definition's default field values
            GenerateForm.applyDefaults(form, $scope);

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
        	
        	CreateSelect2({
                element: '#vrf_datacenter',
                multiple: false,
            });
            	
            $scope.isAddForm = true;
        }
    
        $scope.toggleForm = function(key) {
            $scope[key] = !$scope[key];
        };
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
            
            Wait('start');
            Rest.post(data)
                .then(({data}) => {
                    var base = $location.path().replace(/^\//, '').split('/')[0];
                    if (base === 'ipam_vrfs') {
                        $rootScope.flashMessage = i18n._('New VRF successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "vrf", data.id);
                        $state.go('ipamVrfsList.edit', { vrf_id: data.id }, { reload: true });
                    } else {
                        ReturnToCaller(1);
                    }
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new Vrf. POST returned status: ') + status });
                });
        };

        $scope.formCancel = function() {
            $state.go('ipamVrfsList');
        };
    }
];
