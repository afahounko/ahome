/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import BackupsList from './list/backups-list.controller';
import BackupsAdd from './add/backups-add.controller';
import BackupsEdit from './edit/backups-edit.controller';
import BackupBox from './backups.box';
import BackupForm from './backups.form';
import BackupList from './backups.list';

import { N_ } from '../i18n';

export default
angular.module('infraBackupsList', [])
   .controller('BackupsList', BackupsList)
   .controller('BackupsAdd', BackupsAdd)
   .controller('BackupsEdit', BackupsEdit)
   .factory('BackupBox', BackupBox)
   .factory('BackupForm', BackupForm)
   .factory('BackupList', BackupList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();
			console.log("Backup Main");
            function generateStateTree() {
                let BackupsTree = stateDefinitions.generateTree({
                    parent: 'infraBackupsList',
                    modes: ['add', 'edit'],
                    box: 'BackupBox',
                    list: 'BackupList',
                    formss: 'BackupForm',
                    modalDlg: true,
                    controllers: {
                        list: BackupsList,
                        add: BackupsAdd,
                       	edit: BackupsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'backup'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA BACKUP')
                    },
                });
                return Promise.all([
                    BackupsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraBackupsList.**',
                url: '/ipam_backups',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	