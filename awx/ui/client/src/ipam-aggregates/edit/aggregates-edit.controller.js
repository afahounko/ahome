/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$scope', '$rootScope', '$stateParams', 'AggregateForm', 'Rest',
    'ProcessErrors', 'GetBasePath', 'Wait', 'CreateSelect2', '$state', 'i18n',
    function($scope, $rootScope, $stateParams, AggregateForm, Rest, ProcessErrors,
    GetBasePath, Wait, CreateSelect2, $state, i18n) {

        var form = AggregateForm,
            master = {},
            id = $stateParams.aggregate_id,
            defaultUrl = GetBasePath('ipam_aggregates') + id;
        
        init();

        function init() {
            Rest.setUrl(defaultUrl);
            Wait('start');
            Rest.get(defaultUrl).then(({data}) => {
            		
                    $scope.aggregate_id = id;
                    $scope.aggregate_obj = data;
                    
                    $scope.prefix = data.prefix;
					$scope.description = data.description;
					
					var datacenter_value = data.datacenter;
					var rir_value = data.rir;

			        var datacenter_options = [];
					var datacenterLists = [];
			    	Rest.setUrl(GetBasePath('ipam_datacenters'));
			        Rest.get().then(({data}) => {
			        	datacenterLists = data.results;
			        	for (var i = 0; i < datacenterLists.length; i++) {
			        		datacenter_options.push({label:datacenterLists[i].name, value:datacenterLists[i].id});
			        	}
			        	$scope.datacenter_type_options = datacenter_options;
			            for (var i = 0; i < datacenter_options.length; i++) {
			                if (datacenter_options[i].value === datacenter_value) {
			                    $scope.datacenter = datacenter_options[i];
			                    break;
			                }
			            }
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
			            for (var i = 0; i < rir_options.length; i++) {
			                if (rir_options[i].value === rir_value) {
			                    $scope.rir = rir_options[i];
			                    break;
			                }
			            }
			        })
		        	.catch(({data, status}) => {
		            	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get RIR. Get returned status: ') + status });
					});
		        	
		        	CreateSelect2({
		                element: '#aggregate_rir',
		                multiple: false,
		            });

                    Wait('stop');
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, null, {
                        hdr: i18n._('Error!'),
                        msg: i18n.sprintf(i18n._('Failed to retrieve Aggregate: %s. GET status: '), $stateParams.id) + status
                    });
                });
        }
    
        $scope.toggleForm = function(key) {
            $scope[key] = !$scope[key];
        };
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
            if($scope.datacenter != null) data.datacenter = $scope.datacenter.value;
            if($scope.rir != null) data.rir = $scope.rir.value;
            return data;
        };

        $scope.formCancel = function() {
            $state.go('ipamAggregatesList', null, { reload: true });
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
                            msg: i18n.sprintf(i18n._('Failed to retrieve Aggregate: %s. GET status: '), $stateParams.id) + status
                        });
                    });
            }
        };
    }
];
