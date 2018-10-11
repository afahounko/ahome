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

export default ['$scope', '$rootScope', 'DatacenterForm', 'GenerateForm', 'Rest',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n',
    function($scope, $rootScope, DatacenterForm, GenerateForm, Rest, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2,
    $state, $location, i18n) {

        var defaultUrl = GetBasePath('ipam_datacenters'),
            form = DatacenterForm;
		console.log(form);
        init();

        function init() {
            // apply form definition's default field values

            console.log("init");
            GenerateForm.applyDefaults(form, $scope);

            $scope.isAddForm = true;
            
			$scope.select0 = 'is-selected';
            $scope.tabId = 0;
            
        }

		$scope.select = function(param)
		{
			$scope.tabId = param;
			if ($scope.tabId == 0) {
				$scope.select0 = "is-selected";
				$scope.select1 = "";
				$scope.select2 = "";
			}
			else if ($scope.tabId == 1) {
				$scope.select0 = "";
				$scope.select1 = "is-selected";
				$scope.select2 = "";

			}
			else if ($scope.tabId == 2) {
				$scope.select0 = "";
				$scope.select1 = "";
				$scope.select2 = "is-selected";
			}

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
            Wait('start');
            Rest.post(data)
                .then(({data}) => {
                    var base = $location.path().replace(/^\//, '').split('/')[0];
                    if (base === 'ipam_datacenters') {
                        $rootScope.flashMessage = i18n._('New datacenter successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "datacenter", data.id);
                        $state.go('ipamDatacentersList.edit', { datacenter_id: data.id }, { reload: true });
                    } else {
                        ReturnToCaller(1);
                    }
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new datacenter. POST returned status: ') + status });
                });
        };

        $scope.formCancel = function() {
            $state.go('ipamDatacentersList');
        };
    }
];
