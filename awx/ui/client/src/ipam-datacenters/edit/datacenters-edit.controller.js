/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', '$stateParams', 'DatacenterForm', 'Rest',
    'ProcessErrors', 'GetBasePath', 'Wait', 'CreateSelect2',
    '$state', 'i18n',
    function($scope, $rootScope, $stateParams, DatacenterForm, Rest, ProcessErrors,
    GetBasePath, Wait, CreateSelect2, $state, i18n) {

        var form = DatacenterForm,
            master = {},
            id = $stateParams.datacenter_id,
            defaultUrl = GetBasePath('ipam_datacenters') + id;
        
        init();

        function init() {
            Rest.setUrl(defaultUrl);
            Wait('start');
            Rest.get(defaultUrl).then(({data}) => {
            		
                    $scope.datacenter_id = id;

                    $scope.datacenter_obj = data;
                    $scope.name = data.name;
                    setScopeFields(data);

                    Wait('stop');
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, null, {
                        hdr: i18n._('Error!'),
                        msg: i18n.sprintf(i18n._('Failed to retrieve datacenter: %s. GET status: '), $stateParams.id) + status
                    });
                });
			$scope.select0 = 'is-selected';
            $scope.tabId = 0;
            
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
            return data;
        };
        
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
        $scope.formCancel = function() {
            $state.go('ipamDatacentersList', null, { reload: true });
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
                            msg: i18n.sprintf(i18n._('Failed to retrieve datacenter: %s. GET status: '), $stateParams.id) + status
                        });
                    });
            }
        };
    }
];
