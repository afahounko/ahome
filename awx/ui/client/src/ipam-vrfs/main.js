/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import VrfsList from './list/vrfs-list.controller';
import VrfsAdd from './add/vrfs-add.controller';
import VrfsEdit from './edit/vrfs-edit.controller';
import VrfForm from './vrfs.form';
import VrfList from './vrfs.list';

import { N_ } from '../i18n';

export default
angular.module('ipamVrfsList', [])
   .controller('VrfsList', VrfsList)
   .controller('VrfsAdd', VrfsAdd)
   .controller('VrfsEdit', VrfsEdit)
   .factory('VrfForm', VrfForm)
   .factory('VrfList', VrfList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let VrfsTree = stateDefinitions.generateTree({
                    parent: 'ipamVrfsList',
                    modes: ['add', 'edit'],
                    list: 'VrfList',
                    form: 'VrfForm',
                    controllers: {
                        list: VrfsList,
                        add: VrfsAdd,
                       	edit: VrfsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'vrf'
                    },
                    ncyBreadcrumb: {
                        label: N_('IPAM VRFS')
                    },
                });
                return Promise.all([
                    VrfsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'ipamVrfsList.**',
                url: '/ipam_vrfs',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	