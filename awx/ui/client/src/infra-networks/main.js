/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import NetworksList from './list/networks-list.controller';
import NetworksAdd from './add/networks-add.controller';
import NetworksEdit from './edit/networks-edit.controller';
import NetworkBox from './networks.box';
import NetworkForm from './networks.form';
import NetworkList from './networks.list';

import { N_ } from '../i18n';

export default
angular.module('infraNetworksList', [])
   .controller('NetworksList', NetworksList)
   .controller('NetworksAdd', NetworksAdd)
   .controller('NetworksEdit', NetworksEdit)
   .factory('NetworkBox', NetworkBox)
   .factory('NetworkForm', NetworkForm)
   .factory('NetworkList', NetworkList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();

            function generateStateTree() {
                let networksTree = stateDefinitions.generateTree({
                    parent: 'infraNetworksList',
                    modes: ['add', 'edit'],
                    box: 'NetworkBox',
                    list: 'NetworkList',
                    formss: 'NetworkForm',
                    modalDlg: true,
                    controllers: {
                        list: NetworksList,
                        add: NetworksAdd,
                       	edit: NetworksEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'network'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA NETWORKS')
                    },
                });
                return Promise.all([
                    networksTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraNetworksList.**',
                url: '/ipam_networks',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	