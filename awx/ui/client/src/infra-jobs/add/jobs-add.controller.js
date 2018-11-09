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
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n', 'ParseVariableString', 'SaveSubItem',
    function ($window, $scope, $rootScope, JobForm, GenerateForm, Rest, ParseTypeChange, Alert,
        ProcessErrors, ReturnToCaller, GetBasePath, MultiCredentialService, ProjectUpdate, Wait, CreateSelect2,
		$state, $location, i18n, ParseVariableString, SaveSubItem) {

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
            console.log(fk_model);
            console.log(fk_type);
            console.log(fk_id);
            console.log(id_type);
            console.log(form);
            GenerateForm.applyDefaults(form, $scope);

            $scope.paramCategory = fk_model + '.' + fk_type

            $scope.isAddForm = true;

            $scope.status1 = "active";
            $scope.tabId = 1;
            $scope.previous = "CLOSE";
            $scope.next = "NEXT";

			Rest.setUrl(GetBasePath('ipam_' + fk_model) + fk_id + '/');
            Rest.get().then(({ data }) => {
                parentData = data;
                console.log(parentData);
                
	            var datacenter_options = [];
	            var datacenterLists = [];
	            Rest.setUrl(GetBasePath('ipam_datacenters'));
	            Rest.get().then(({ data }) => {
	                datacenterLists = data.results;
	                for (var i = 0; i < datacenterLists.length; i++) {
	                    datacenter_options.push({ label: datacenterLists[i].name, value: datacenterLists[i].id });
	                }
	                $scope.datacenter_type_options = datacenter_options;
	            })

	            var credential_options = [];
	            Rest.setUrl(GetBasePath('credentials'));
	            Rest.get().then(({ data }) => {
	                var credentialLists = data.results;
	                for (var i = 0; i < credentialLists.length; i++)
	                    credential_options.push({ label: credentialLists[i].name, value: credentialLists[i].id });
	                $scope.credential_type_options = credential_options;
	                //Set Selectbox
	                for (var i = 0; i < credential_options.length; i++) {
	                    if (credential_options[i].value === parseInt(parentData.opts.credential_id)) {
	                        $scope.credential = credential_options[i];
	                        break;
	                    }
	                }
	            })

	            CreateSelect2({
	                element: '#' + id_type + '_datacenter',
	                multiple: false,
	            });

	            CreateSelect2({
	                element: '#' + id_type + '_credential',
	                multiple: false,
	            });

            })
            .catch(({ data, status }) => {
                ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get datacenters. Get returned status: ') + status });
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
        var processExtras = function (job_template) {
            var fld, subid;
            var data = "{";
            console.log($scope);
            for (fld in job_template) {

                if (fld != "extra_vars") {
                    data += "'ahome_" + fld + "':";
                    if (job_template[fld] != undefined) data += "'" + job_template[fld] + "'";
                    else data += "''";
                    data += ",\n";
                }
            }
            data += "'extra_vars':''\n";
            data += "}";
            return data;
        };

        // prepares a data payload for a PUT request to the API
        var processNewData = function (fields) {
            var data = {};
            _.forEach(fields, function (value, key) {
                if ($scope[key] !== '' && $scope[key] !== null && $scope[key] !== undefined) {
                    data[key] = $scope[key];
                }
            });
            data.scm_type = "";
            data.fk_model = fk_model;
            data.fk_type = fk_type;
            data.fk_id = fk_id;
            if ($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if ($scope.credential != null) data.credential = $scope.credential.value;
            data.opts = $scope.opts;
            return data;
        };

        // Save
        $scope.formSave = function () {
        	var data_subitem = processNewData(form.fields);
        	var extra_vars = processExtras(parentData.opts);
			SaveSubItem(parentData, defaultUrl, form, data_subitem, extra_vars);
        };

        $scope.formCancel = function () {
            $state.go('infraJobsList', null, { reload: true });
        };
    }
];
