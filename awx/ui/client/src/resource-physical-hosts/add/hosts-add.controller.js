/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', 'HostForm', 'GenerateForm', 'Rest',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n', 'ParseTypeChange', 'ToJSON',
    function($scope, $rootScope, HostForm, GenerateForm, Rest, Alert,
    ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2,
	$state, $location, i18n, ParseTypeChange, ToJSON) {

        var defaultUrl = GetBasePath('ipam_bare_metals'),
            form = HostForm;

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
	        })
        	.catch(({data, status}) => {
            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get datacenters. Get returned status: ') + status });
			});
        	
			$scope.datacenter_type_options = datacenter_options;

			var credential_options = [];
			Rest.setUrl(GetBasePath('credentials'));
	        Rest.get().then(({data}) => {
	        	var credentialLists = data.results;
	        	for (var i = 0; i < credentialLists.length; i++)
	        		credential_options.push({label:credentialLists[i].name, value:credentialLists[i].id});
	        })
        	.catch(({data, status}) => {
            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get datacenters. Get returned status: ') + status });
			});
			$scope.credential_type_options = credential_options;
			
            CreateSelect2({
                element: '#baremetal_datacenter',
                multiple: false,
            });
            CreateSelect2({
                element: '#baremetal_credential',
                multiple: false,
            });
            // apply form definition's default field values
            GenerateForm.applyDefaults(form, $scope);
			
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

				var callback = function() {
		            // Make sure the form controller knows there was a change
		            $scope[form.name + '_form'].$setDirty();
		        };
		        
		        $scope.parseTypeOpts = 'yaml';
		        ParseTypeChange({
		            scope: $scope,
		            field_id: 'opts',
		            variable: 'opts',
		            onChange: callback,
		            parse_variable: 'parseTypeOpts'
		        });
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
            
            data.datacenter = $scope.datacenter.value;
            data.credential = $scope.credential.value;
            //data.opts = ToJSON($scope.parseTypeOpts, $scope.opts);
            //if (data.opts == null){
        	//	data.opts = {};
        	//}
        	data.opts = $scope.opts;
            Wait('start');
            Rest.post(data)
                .then(({data}) => {
                    var base = $location.path().replace(/^\//, '').split('/')[0];
                    if (base === 'ipam_bare_metals') {
                        $rootScope.flashMessage = i18n._('New bare metal successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "bare metal", data.id);
                        $state.go('resourcePhysicalHostsList.edit', { baremetal_id: data.id }, { reload: true });
                    } else {
                        ReturnToCaller(1);
                    }
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new bare metal. POST returned status: ') + status });
                });
        };

        $scope.formCancel = function() {
            $state.go('resourcePhysicalHostsList');
        };
    }
];
