/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import IPAddrsList from './list/ipaddrs-list.controller';
import IPAddrsAdd from './add/ipaddrs-add.controller';
import IPAddrsEdit from './edit/ipaddrs-edit.controller';
import IPAddrForm from './ipaddr.form';
import IPAddrList from './ipaddr.list';

import { N_ } from '../i18n';

export default
angular.module('ipamIpAddressesList', [])
   .controller('IPAddrsList', IPAddrsList)
   .controller('IPAddrsAdd', IPAddrsAdd)
   .controller('IPAddrsEdit', IPAddrsEdit)
   .factory('IPAddrForm', IPAddrForm)
   .factory('IPAddrList', IPAddrList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let ipaddrsTree = stateDefinitions.generateTree({
                    parent: 'ipamIpAddressesList',
                    modes: ['add', 'edit'],
                    list: 'IPAddrList',
                    form: 'IPAddrForm',
                    controllers: {
                        list: IPAddrsList,
                        add: IPAddrsAdd,
                       	edit: IPAddrsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'ipaddr'
                    },
                    ncyBreadcrumb: {
                        label: N_('IPAM IP Address')
                    },
                });
                return Promise.all([
                    ipaddrsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'ipamIpAddressesList.**',
                url: '/ipam_ip_addresses',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	