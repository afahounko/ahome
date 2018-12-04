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

export default ['$window', '$scope', '$rootScope', 'JobForm', 'GenerateForm', 'Rest', 'ParseTypeChange',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath', 'MultiCredentialService', 'ProjectUpdate',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n', 'ParseVariableString', 'SaveInfraSubItem', 'initSelect',
    function ($window, $scope, $rootScope, JobForm, GenerateForm, Rest, ParseTypeChange, Alert,
        ProcessErrors, ReturnToCaller, GetBasePath, MultiCredentialService, ProjectUpdate, Wait, CreateSelect2,
		$state, $location, i18n, ParseVariableString, SaveInfraSubItem, initSelect) {

        var defaultUrl = GetBasePath('ipam_infrastructure_jobs'),
            fk_model = $window.localStorage.getItem('fk_model'),
            fk_type = $window.localStorage.getItem('fk_type'),
            fk_id = $window.localStorage.getItem('fk_id'),
            id_type = $window.localStorage.getItem('form_id'),
            parentData = [],
            form = JobForm[id_type],
            mcredentials = [];

        init();

        function init() {
            // apply form definition's default field values
            //$scope.canAdd = true;
            console.log("Add FORM Init");
            console.log(form);
            GenerateForm.applyDefaults(form, $scope);

            $scope.paramCategory = fk_model + '.' + fk_type

            $scope.isAddForm = true;

            $scope.status1 = "active";
            $scope.tabId = 1;
            $scope.previous = "CLOSE";
            $scope.next = "NEXT";

			if(form.fields.datacenter) $scope.datacenter_type_options = initSelect('ipam_datacenters', '', form.fields.datacenter.ngFilter ? form.fields.datacenter.ngFilter : "");
	        if(form.fields.credential) $scope.credential_type_options = initSelect('credentials', '', form.fields.credential.ngFilter ? form.fields.credential.ngFilter : "");
		    if(form.fields.ipaddress)  $scope.ipaddress_type_options = initSelect('ipam_ip_addresses', '', form.fields.ipaddress.ngFilter ? form.fields.ipaddress.ngFilter : "");
		    
		    CreateSelect2({
                element: '#' + id_type + '_kind',
                multiple: false,
            });

            CreateSelect2({
                element: '#' + id_type + '_datacenter',
                multiple: false,
            });

            CreateSelect2({
                element: '#' + id_type + '_credential',
                multiple: false,
            });

            CreateSelect2({
                element: '#' + id_type + '_ipaddress',
                multiple: false,
            });

            //for multi credential 2018/10/25
            MultiCredentialService.getCredentialTypes()
                .then(({ data }) => {
                    $scope.multiCredential = {
                        credentialTypes: data.results,
                        selectedCredentials: []
                    };
                });

            // change to modal dialog

            var element = document.getElementById("modaldlg");
            element.style.display = "block";
            var panel = element.getElementsByClassName("Panel ng-scope");
            panel[0].classList.add("modal-dialog");
            panel[0].style.width = "60%";

        }

        var callback = function () {
            // Make sure the form controller knows there was a change
            $scope[form.name + '_form'].$setDirty();
        };

        $scope.toggleForm = function (key) {
            $scope[key] = !$scope[key];
        };

        function getVars(str) {
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

            if (str === '') {
                return '---';
            }
            else if (IsJsonString(str)) {
                str = JSON.parse(str);
                return jsyaml.safeDump(str);
            }
            else if (!IsJsonString(str)) {
                return str;
            }
        }

        $scope.WizardClick = function (clickID) {
            if (clickID == 1) {
                if ($scope.tabId > 1)
                    $scope.tabId = $scope.tabId - 1;
            }
            else if (clickID == 2) {

                if ($scope.tabId < 3) {
                    $scope.tabId = $scope.tabId + 1;
                }
                if ($scope.tabId == 1) {
                    $scope.opts = "---";
                }
                if ($scope.tabId == 3) {
                    var fld, subid;
                    var data = "{";
                    console.log($scope);
                    for (fld in form.fields) {

                        if (fld == "datacenter" || fld == "credential") {
                            data += "'" + fld + "':";
                            if ($scope[fld] != undefined) data += "'" + $scope[fld].value + "'";
                            else data += "''";
                            data += ",\n";
                            continue;
                        }
                        if (fld == "multiCredential") {
                            mcredentials = [];
                            data += "'" + fld + "':";
                            if ($scope[fld]['selectedCredentials'] != undefined) {
                                data += "'"
                                for (subid in $scope[fld]['selectedCredentials']) {
                                    var cred = {};
                                    console.log($scope[fld]['selectedCredentials'][subid]);
                                    cred.id = $scope[fld]['selectedCredentials'][subid].id;
                                    data += $scope[fld]['selectedCredentials'][subid].id + ',';
                                    mcredentials.push(cred);
                                }
                                data += "',";
                            }
                            else data += "'',";
                            data += "\n";
                            console.log(mcredentials);
                            continue;
                        }
                        if (fld != "opts") {
                            data += "'" + fld + "':";
                            if ($scope[fld] != undefined) data += "'" + $scope[fld] + "'";
                            else data += "''";
                            data += ",\n";
                        }
                    }
                    data += "'id_type':'" + id_type + "',\n";
                    data += "'fk_model':'" + fk_model + "',\n";
                    data += "'fk_type':'" + fk_type + "',\n";
                    data += "'fk_id':'" + fk_id + "',\n";
                    data += "'scm_type':''\n";
                    data += "}";
                    $scope.opts = ParseVariableString(data);
                    $scope.parseTypeOpts = 'yaml';
                    console.log(form);
                    ParseTypeChange({
                        scope: $scope,
                        field_id: id_type + '_opts',
                        variable: 'opts',
                        onChange: callback,
                        parse_variable: 'parseTypeOpts'
                    });
                }
            }

            if ($scope.tabId == 1) {
                $scope.status1 = "active";
                $scope.status2 = "";
                $scope.status3 = "";
            }
            else if ($scope.tabId == 2) {
                $scope.status1 = "complete";
                $scope.status2 = "active";
                $scope.status3 = "";
            }
            else if ($scope.tabId == 3) {
                $scope.status1 = "complete";
                $scope.status2 = "complete";
                $scope.status3 = "active";
            }
        };


        // prepares a data payload for a PUT request to the API


        // prepares a data payload for a PUT request to the API
        var processNewData = function (fields) {
            var data = {};
            _.forEach(fields, function (value, key) {
                if ($scope[key] !== '' && $scope[key] !== null && $scope[key] !== undefined) {
                    data[key] = $scope[key];
                }
            });
            data.scm_type = "";
            data.id_type = id_type;
            data.fk_model = fk_model;
            data.fk_type = fk_type;
            data.fk_id = fk_id;
            if ($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if ($scope.credential != null) data.credential = $scope.credential.value;
            data.opts = $scope.opts;
            console.log(data);
            return data;
        };

        // Save
        $scope.formSave = function () {
        	var data_subitem = processNewData(form.fields);
        	console.log(data_subitem);
			SaveInfraSubItem(parentData, defaultUrl, form, data_subitem);
        };

        $scope.formCancel = function () {
            $state.go('infraJobsList', null, { reload: true });
        };
    }
];
