/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import SecuritiesList from './list/securities-list.controller';
import SecuritiesAdd from './add/securities-add.controller';
import SecuritiesEdit from './edit/securities-edit.controller';
import SecurityBox from './securities.box';
import SecurityForm from './securities.form';
import SecurityList from './securities.list';

import { N_ } from '../i18n';

export default
angular.module('infraSecuritiesList', [])
   .controller('SecuritiesList', SecuritiesList)
   .controller('SecuritiesAdd', SecuritiesAdd)
   .controller('SecuritiesEdit', SecuritiesEdit)
   .factory('SecurityBox', SecurityBox)
   .factory('SecurityForm', SecurityForm)
   .factory('SecurityList', SecurityList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();

            function generateStateTree() {
                let securitiesTree = stateDefinitions.generateTree({
                    parent: 'infraSecurityList',
                    modes: ['add', 'edit'],
                    box: 'SecurityBox',
                    list: 'SecurityList',
                    formss: 'SecurityForm',
                    modalDlg: true,
                    controllers: {
                        list: SecuritiesList,
                        add: SecuritiesAdd,
                       	edit: SecuritiesEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'security'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA SECURITIES')
                    },
                });
                return Promise.all([
                    securitiesTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraSecurityList.**',
                url: '/ipam_securities',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	