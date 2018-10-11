/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', '$stateParams', 'RirForm', 'Rest',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', 'i18n',
    function($scope, $rootScope, $stateParams, RirForm, Rest, ProcessErrors,
    GetBasePath, Wait, $state, i18n) {

        var form = RirForm,
            master = {},
            id = $stateParams.rir_id,
            defaultUrl = GetBasePath('ipam_rirs') + id;
        
        init();

        function init() {
            Rest.setUrl(defaultUrl);
            Wait('start');
            Rest.get(defaultUrl).then(({data}) => {
            		
                    $scope.rir_id = id;

                    $scope.rir_obj = data;
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

        $scope.formCancel = function() {
            $state.go('ipamRirsList', null, { reload: true });
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
                            msg: i18n.sprintf(i18n._('Failed to retrieve rir: %s. GET status: '), $stateParams.id) + status
                        });
                    });
            }
        };
    }
];
