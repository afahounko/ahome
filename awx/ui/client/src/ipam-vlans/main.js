/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import VLansList from './list/vlans-list.controller';
import VLansAdd from './add/vlans-add.controller';
import VLansEdit from './edit/vlans-edit.controller';
import VLanForm from './vlan.form';
import VLanList from './vlan.list';

import { N_ } from '../i18n';

export default
angular.module('ipamVlansList', [])
   .controller('VLansList', VLansList)
   .controller('VLansAdd', VLansAdd)
   .controller('VLansEdit', VLansEdit)
   .factory('VLanForm', VLanForm)
   .factory('VLanList', VLanList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let vlansTree = stateDefinitions.generateTree({
                    parent: 'ipamVlansList',
                    modes: ['add', 'edit'],
                    list: 'VLanList',
                    form: 'VLanForm',
                    controllers: {
                        list: VLansList,
                        add: VLansAdd,
                       	edit: VLansEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'vlan'
                    },
                    ncyBreadcrumb: {
                        label: N_('IPAM VLANS')
                    },
                });
                return Promise.all([
                    vlansTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'ipamVlansList.**',
                url: '/ipam_vlans',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	