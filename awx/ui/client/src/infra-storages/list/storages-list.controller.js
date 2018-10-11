/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', 'Rest', 'StorageList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($window, $scope, $rootScope, Rest, StorageList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
    Dataset, i18n) {

        var list = StorageList,
        defaultUrl = GetBasePath('ipam_storages');

        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_storages')
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
            console.log("Add Storage infraStorage" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraStoragesList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.storages.' + this.storage.related.opts.id_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'storages');
        	$window.localStorage.setItem('fk_type', this.storage.related.opts.id_type);
        	$window.localStorage.setItem('fk_id', this.storage.id);
            $state.go('infraJobsList');
			console.log("State Go finished");
        };
        
        $scope.launchStorage= function() {
        	console.log("Launch");
            //$rootScope.form_id = this.storage.related.opts.id_type;
            //$state.go('infraJobsList', null, { reload: true});
        };

        $scope.editStorage= function() {
        	console.log("stateGO");
            console.log('infraStoragesList.edit_' + this.storage.related.opts.id_type);
            $window.localStorage.setItem('form_id', this.storage.related.opts.id_type);
            $state.go('infraStoragesList.edit_' + this.storage.related.opts.id_type, { storage_id: this.storage.id });
        };

        $scope.deleteStorage = function(id, name) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                Wait('start');
                var url = defaultUrl + id + '/';
                Rest.setUrl(url);
                Rest.destroy()
                    .then(() => {
                        let reloadListStateParams = null;

                        if($scope.ipam_storages.length === 1 && $state.params.storage_search && !_.isEmpty($state.params.storage_search.page) && $state.params.storage_search.page !== '1') {
                            reloadListStateParams = _.cloneDeep($state.params);
                            reloadListStateParams.storage_search.page = (parseInt(reloadListStateParams.storage_search.page)-1).toString();
                        }

                        if (parseInt($state.params.storage_id) === id) {
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
            };

            Prompt({
                hdr: i18n._('Delete'),
                resourceName: $filter('sanitize')(name),
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Storage?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
