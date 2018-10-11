/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import HostsList from './list/hosts-list.controller';
import HostsAdd from './add/hosts-add.controller';
import HostsEdit from './edit/hosts-edit.controller';
import HostForm from './host.form';
import HostList from './host.list';

import { N_ } from '../i18n';

export default
angular.module('resourcePhysicalHostsList', [])
   .controller('HostsList', HostsList)
   .controller('HostsAdd', HostsAdd)
   .controller('HostsEdit', HostsEdit)
   .factory('HostForm', HostForm)
   .factory('HostList', HostList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let hostsTree = stateDefinitions.generateTree({
                    parent: 'resourcePhysicalHostsList',
                    modes: ['add', 'edit'],
                    list: 'HostList',
                    form: 'HostForm',
                    controllers: {
                        list: HostsList,
                        add: HostsAdd,
                       	edit: HostsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'baremetal'
                    },
                    ncyBreadcrumb: {
                        label: N_('IPAM Bare Metals')
                    },
                });
                return Promise.all([
                    hostsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'resourcePhysicalHostsList.**',
                url: '/ipam_bare_metals',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	