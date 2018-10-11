/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', 'AggregateForm', 'GenerateForm', 'Rest',
    'Alert', 'ProcessErrors', 'ReturnToCaller', 'GetBasePath',
    'Wait', 'CreateSelect2', '$state', '$location', 'i18n',
    function($scope, $rootScope, AggregateForm, GenerateForm, Rest, Alert,
	ProcessErrors, ReturnToCaller, GetBasePath, Wait, CreateSelect2, $state, $location, i18n) {

        var defaultUrl = GetBasePath('ipam_aggregates'),
            form = AggregateForm;

        init();

        function init() {
            // apply form definition's default field values
            GenerateForm.applyDefaults(form, $scope);
			Wait('start');
			
        	var datacenter_options = [];
        	Rest.setUrl(GetBasePath('ipam_datacenters'));
	        Rest.get().then(({data}) => {
	        	var datacenterLists = data.results;
	        	for (var i = 0; i < datacenterLists.length; i++)
	        		datacenter_options.push({label:datacenterLists[i].name, value:datacenterLists[i].id});
	        	$scope.datacenter_type_options = datacenter_options;
	        	$scope.datacenter = null;
	        })
        	.catch(({data, status}) => {
            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get datacenters. Get returned status: ') + status });
			});
        	
        	CreateSelect2({
                element: '#aggregate_datacenter',
                multiple: false,
            });

        	var rir_options = [];
        	Rest.setUrl(GetBasePath('ipam_rirs'));
	        Rest.get().then(({data}) => {
	        	var rirLists = data.results;
	        	for (var i = 0; i < rirLists.length; i++)
	        		rir_options.push({label:rirLists[i].name, value:rirLists[i].id});
	        	$scope.rir_type_options = rir_options;
	        	$scope.rir = null;
	        })
        	.catch(({data, status}) => {
            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get RIR. Get returned status: ') + status });
			});
        	
        	CreateSelect2({
                element: '#aggregate_rir',
                multiple: false,
            });

			Wait('stop');
            $scope.isAddForm = true;
        }

        $scope.toggleForm = function(key) {
            $scope[key] = !$scope[key];
        };
        // Save
        $scope.formSave = function() {
            var fld, data = {};

			data.prefix = $scope.prefix;
			data.description = $scope.description;
			
            if($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if($scope.rir != null) data.rir = $scope.rir.value;
            
            Wait('start');
            Rest.setUrl(defaultUrl);
            Rest.post(data)
                .then(({data}) => {
                    var base = $location.path().replace(/^\//, '').split('/')[0];
                    if (base === 'ipam_aggregates') {
                        $rootScope.flashMessage = i18n._('New Aggregate successfully created!');
                        $rootScope.$broadcast("EditIndicatorChange", "Aggregate", data.id);
                        $state.go('ipamAggregatesList.edit', { aggregate_id: data.id }, { reload: true });
                    } else {
                        ReturnToCaller(1);
                    }
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new Aggregate. POST returned status: ') + status });
                });
        };

        $scope.formCancel = function() {
            $state.go('ipamAggregatesList');
        };
    }
];
