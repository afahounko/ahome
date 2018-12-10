/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import PkisList from './list/pkis-list.controller';
import PkisAdd from './add/pkis-add.controller';
import PkisEdit from './edit/pkis-edit.controller';
import PkiBox from './pkis.box';
import PkiForm from './pkis.form';
import PkiList from './pkis.list';

import { N_ } from '../i18n';

export default
angular.module('infraPkiList', [])
   .controller('PkisList', PkisList)
   .controller('PkisAdd', PkisAdd)
   .controller('PkisEdit', PkisEdit)
   .factory('PkiBox', PkiBox)
   .factory('PkiForm', PkiForm)
   .factory('PkiList', PkiList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();

            function generateStateTree() {
                let pkisTree = stateDefinitions.generateTree({
                    parent: 'infraPkiList',
                    modes: ['add', 'edit'],
                    box: 'PkiBox',
                    list: 'PkiList',
                    formss: 'PkiForm',
                    modalDlg: true,
                    controllers: {
                        list: PkisList,
                        add: PkisAdd,
                       	edit: PkisEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'pki'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA PKIS')
                    },
                });
                return Promise.all([
                    pkisTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraPkiList.**',
                url: '/ipam_pkis',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	