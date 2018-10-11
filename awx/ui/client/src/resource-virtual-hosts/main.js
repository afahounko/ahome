/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import VHostsList from './list/vhosts-list.controller';
import VHostsAdd from './add/vhosts-add.controller';
import VHostsEdit from './edit/vhosts-edit.controller';
import VHostForm from './vhost.form';
import VHostList from './vhost.list';

import { N_ } from '../i18n';

export default
angular.module('resourceVirtualHostsList', [])
   .controller('VHostsList', VHostsList)
   .controller('VHostsAdd', VHostsAdd)
   .controller('VHostsEdit', VHostsEdit)
   .factory('VHostForm', VHostForm)
   .factory('VHostList', VHostList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let vhostsTree = stateDefinitions.generateTree({
                    parent: 'resourceVirtualHostsList',
                    modes: ['add', 'edit'],
                    list: 'VHostList',
                    form: 'VHostForm',
                    controllers: {
                        list: VHostsList,
                        add: VHostsAdd,
                       	edit: VHostsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'vhost'
                    },
                    ncyBreadcrumb: {
                        label: N_('Virtual Hosts')
                    },
                });
                return Promise.all([
                    vhostsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'resourceVirtualHostsList.**',
                url: '/ipam_virtual_hosts',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	