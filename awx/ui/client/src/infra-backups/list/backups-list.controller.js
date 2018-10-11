/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', 'Rest', 'BackupList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($window, $scope, $rootScope, Rest, BackupList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
    Dataset, i18n) {

        var list = BackupList,
        defaultUrl = GetBasePath('ipam_backups');

        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_backups')
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
            console.log("Add Backup infraBackup" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraBackupsList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.backups.' + this.backup.related.opts.id_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'backups');
        	$window.localStorage.setItem('fk_type', this.backup.related.opts.id_type);
        	$window.localStorage.setItem('fk_id', this.backup.id);
            $state.go('infraJobsList');
			console.log("State Go finished");
        };
        
        $scope.launchBackup= function() {
        	console.log("Launch");
            //$rootScope.form_id = this.backup.related.opts.id_type;
            //$state.go('infraJobsList', null, { reload: true});
        };

        $scope.editBackup= function() {
        	console.log("stateGO");
            console.log('infraBackupsList.edit_' + this.backup.related.opts.id_type);
            $window.localStorage.setItem('form_id', this.backup.related.opts.id_type);
            $state.go('infraBackupsList.edit_' + this.backup.related.opts.id_type, { backup_id: this.backup.id });
        };

        $scope.deleteBackup = function(id, name) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                Wait('start');
                var url = defaultUrl + id + '/';
                Rest.setUrl(url);
                Rest.destroy()
                    .then(() => {
                        let reloadListStateParams = null;

                        if($scope.ipam_backups.length === 1 && $state.params.backup_search && !_.isEmpty($state.params.backup_search.page) && $state.params.backup_search.page !== '1') {
                            reloadListStateParams = _.cloneDeep($state.params);
                            reloadListStateParams.backup_search.page = (parseInt(reloadListStateParams.backup_search.page)-1).toString();
                        }

                        if (parseInt($state.params.backup_id) === id) {
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
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Backup?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
