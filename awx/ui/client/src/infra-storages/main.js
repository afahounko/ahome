/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import StoragesList from './list/storages-list.controller';
import StoragesAdd from './add/storages-add.controller';
import StoragesEdit from './edit/storages-edit.controller';
import StorageBox from './storages.box';
import StorageForm from './storages.form';
import StorageList from './storages.list';

import { N_ } from '../i18n';

export default
angular.module('infraStoragesList', [])
   .controller('StoragesList', StoragesList)
   .controller('StoragesAdd', StoragesAdd)
   .controller('StoragesEdit', StoragesEdit)
   .factory('StorageBox', StorageBox)
   .factory('StorageForm', StorageForm)
   .factory('StorageList', StorageList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();

            function generateStateTree() {
                let storagesTree = stateDefinitions.generateTree({
                    parent: 'infraStoragesList',
                    modes: ['add', 'edit'],
                    box: 'StorageBox',
                    list: 'StorageList',
                    formss: 'StorageForm',
                    modalDlg: true,
                    controllers: {
                        list: StoragesList,
                        add: StoragesAdd,
                       	edit: StoragesEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'storage'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA STORAGES')
                    },
                });
                return Promise.all([
                    storagesTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraStoragesList.**',
                url: '/ipam_storages',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	