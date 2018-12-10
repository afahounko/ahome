/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import AppsList from './list/apps-list.controller';
import AppsAdd from './add/apps-add.controller';
import AppsEdit from './edit/apps-edit.controller';
import AppBox from './apps.box';
import AppForm from './apps.form';
import AppList from './apps.list';

import { N_ } from '../i18n';

export default
angular.module('infraAppsList', [])
   .controller('AppsList', AppsList)
   .controller('AppsAdd', AppsAdd)
   .controller('AppsEdit', AppsEdit)
   .factory('AppBox', AppBox)
   .factory('AppForm', AppForm)
   .factory('AppList', AppList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();
			console.log("App Main");
            function generateStateTree() {
                let AppsTree = stateDefinitions.generateTree({
                    parent: 'infraAppsList',
                    modes: ['add', 'edit'],
                    box: 'AppBox',
                    list: 'AppList',
                    formss: 'AppForm',
                    modalDlg: true,
                    controllers: {
                        list: AppsList,
                        add: AppsAdd,
                       	edit: AppsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'app'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA APPS')
                    },
                });
                return Promise.all([
                    AppsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraAppsList.**',
                url: '/ipam_apps',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	