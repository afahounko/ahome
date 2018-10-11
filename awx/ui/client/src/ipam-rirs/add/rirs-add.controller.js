/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', 'RirForm', 'GenerateForm', 'Rest',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', '$state', '$location', 'i18n',
    function($scope, $rootScope, RirForm, GenerateForm, Rest, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, Wait, $state, $location, i18n) {

        var defaultUrl = GetBasePath('ipam_rirs'),
            form = RirForm;

        init();

        function init() {
            // apply form definition's default field values
            GenerateForm.applyDefaults(form, $scope);

            $scope.isAddForm = true;
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

            Wait('start');
            Rest.post(data)
                .then(({data}) => {
                    var base = $location.path().replace(/^\//, '').split('/')[0];
                    if (base === 'ipam_rirs') {
                        $rootScope.flashMessage = i18n._('New datacenter successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "rir", data.id);
                        $state.go('ipamRirsList.edit', { rir_id: data.id }, { reload: true });
                    } else {
                        ReturnToCaller(1);
                    }
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new rir. POST returned status: ') + status });
                });
        };

        $scope.formCancel = function() {
            $state.go('ipamRirsList');
        };
    }
];
