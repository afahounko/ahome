/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', 'Rest', 'ProviderList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($window, $scope, $rootScope, Rest, ProviderList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
    Dataset, i18n) {

        var list = ProviderList,
        defaultUrl = GetBasePath('ipam_providers');

        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_providers')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
                
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
        }

        $scope.addNew = function(param) {
            console.log("Add Provider infraProvider" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraProvidersList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.providers.' + this.provider.related.opts.id_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'providers');
        	$window.localStorage.setItem('fk_type', this.provider.related.opts.id_type);
        	$window.localStorage.setItem('fk_id', this.provider.id);

            $rootScope.infraJob = "infraProvidersList";
			console.log($rootScope.infraJob);

            $state.go('infraJobsList');
			console.log("State Go finished");
        };
        
        $scope.launchProvider= function() {
        	console.log("Launch");
            //$rootScope.form_id = this.provider.related.opts.id_type;
            //$state.go('infraJobsList', null, { reload: true});
        };

        $scope.editProvider= function() {
        	console.log("stateGO");
            console.log('infraProvidersList.edit_' + this.provider.related.opts.id_type);
            $window.localStorage.setItem('form_id', this.provider.related.opts.id_type);
            $state.go('infraProvidersList.edit_' + this.provider.related.opts.id_type, { provider_id: this.provider.id });
        };

        $scope.deleteProvider = function(id, name) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                
                Wait('start');
                
                Rest.setUrl(defaultUrl + id);
                Rest.get(defaultUrl).then(({data}) => {
                		if(data.opts.credential_id){
                			Rest.setUrl(GetBasePath('credentials') + data.opts.credential_id + '/');
			                Rest.destroy()
			                    .then(() => {
			                        console.log('related credential deleted successfully');
			                    })
			                    .catch(({data, status}) => {
			                        ProcessErrors($scope, data, status, null, {
			                            hdr: i18n._('Error!'),
			                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE CREDENTIAL returned status: '), url) + status
			                        });
			                    });
                		}
	                	var url = defaultUrl + id + '/';
		                Rest.setUrl(url);
		                Rest.destroy()
		                    .then(() => {
		                        let reloadListStateParams = null;

		                        if($scope.ipam_providers.length === 1 && $state.params.provider_search && !_.isEmpty($state.params.provider_search.page) && $state.params.provider_search.page !== '1') {
		                            reloadListStateParams = _.cloneDeep($state.params);
		                            reloadListStateParams.provider_search.page = (parseInt(reloadListStateParams.provider_search.page)-1).toString();
		                        }

		                        if (parseInt($state.params.provider_id) === id) {
		                            $state.go('^', null, { reload: true });
		                        } else {
		                            $state.go('.', null, { reload: true });
		                        }
		                    })
		                    .catch(({data, status}) => {
		                        ProcessErrors($scope, data, status, null, {
		                            hdr: i18n._('Error!'),
		                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE returned status: '), url) + status
		                        });
		                    });
                	})
                    .catch(({data, status}) => {
                        ProcessErrors($scope, data, status, null, {
                            hdr: i18n._('Error!'),
                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE returned status: '), url) + status
                        });
                    });
                
                
            };

            Prompt({
                hdr: i18n._('Delete'),
                resourceName: $filter('sanitize')(name),
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Provider?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
