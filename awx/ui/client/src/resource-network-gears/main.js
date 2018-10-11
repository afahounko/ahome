/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import GearsList from './list/gears-list.controller';
import GearsAdd from './add/gears-add.controller';
import GearsEdit from './edit/gears-edit.controller';
import GearForm from './gear.form';
import GearList from './gear.list';

import { N_ } from '../i18n';

export default
angular.module('resourceNetworkGearsList', [])
   .controller('GearsList', GearsList)
   .controller('GearsAdd', GearsAdd)
   .controller('GearsEdit', GearsEdit)
   .factory('GearForm', GearForm)
   .factory('GearList', GearList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let gearsTree = stateDefinitions.generateTree({
                    parent: 'resourceNetworkGearsList',
                    modes: ['add', 'edit'],
                    list: 'GearList',
                    form: 'GearForm',
                    controllers: {
                        list: GearsList,
                        add: GearsAdd,
                       	edit: GearsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'networkgear'
                    },
                    ncyBreadcrumb: {
                        label: N_('Network Gears')
                    },
                });
                return Promise.all([
                    gearsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'resourceNetworkGearsList.**',
                url: '/ipam_network_gears',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	