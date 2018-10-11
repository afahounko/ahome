/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import DatacentersList from './list/datacenters-list.controller';
import DatacentersAdd from './add/datacenters-add.controller';
import DatacentersEdit from './edit/datacenters-edit.controller';
import DatacenterForm from './datacenters.form';
import DatacenterList from './datacenters.list';

import { N_ } from '../i18n';

export default
angular.module('ipamDatacentersList', [])
   .controller('DatacentersList', DatacentersList)
   .controller('DatacentersAdd', DatacentersAdd)
   .controller('DatacentersEdit', DatacentersEdit)
   .factory('DatacenterForm', DatacenterForm)
   .factory('DatacenterList', DatacenterList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();

			console.log("Datacenter Main");
            function generateStateTree() {
                let datacentersTree = stateDefinitions.generateTree({
                    parent: 'ipamDatacentersList',
                    modes: ['add', 'edit'],
                    list: 'DatacenterList',
                    form: 'DatacenterForm',
                    controllers: {
                        list: DatacentersList,
                        add: DatacentersAdd,
                       	edit: DatacentersEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'datacenter'
                    },
                    ncyBreadcrumb: {
                        label: N_('IPAM Datacenters')
                    },
                    /*
                    resolve: {
                        edit: {
                            resolvedModels: ['MeModel', '$q',  function(Me, $q) {
                                const promises= {
                                    me: new Me('get').then((me) => me.extend('get', 'admin_of_organizations'))
                                };
                                return $q.all(promises);
                            }]
                        },
                        list: {
                            resolvedModels: ['MeModel', '$q',  function(Me, $q) {
                                const promises= {
                                    me: new Me('get')
                                };
                                return $q.all(promises);
                            }]
                        }
                    }, */
                });
                return Promise.all([
                    datacentersTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'ipamDatacentersList.**',
                url: '/ipam_datacenters',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	