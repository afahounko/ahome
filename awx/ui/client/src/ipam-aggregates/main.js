/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import AggregatesList from './list/aggregates-list.controller';
import AggregatesAdd from './add/aggregates-add.controller';
import AggregatesEdit from './edit/aggregates-edit.controller';
import AggregateForm from './aggregates.form';
import AggregateList from './aggregates.list';

import { N_ } from '../i18n';

export default
angular.module('ipamAggregatesList', [])
   .controller('AggregatesList', AggregatesList)
   .controller('AggregatesAdd', AggregatesAdd)
   .controller('AggregatesEdit', AggregatesEdit)
   .factory('AggregateForm', AggregateForm)
   .factory('AggregateList', AggregateList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let AggregatesTree = stateDefinitions.generateTree({
                    parent: 'ipamAggregatesList',
                    modes: ['add', 'edit'],
                    list: 'AggregateList',
                    form: 'AggregateForm',
                    controllers: {
                        list: AggregatesList,
                        add: AggregatesAdd,
                       	edit: AggregatesEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'aggregate'
                    },
                    ncyBreadcrumb: {
                        label: N_('IPAM AGGREGATE')
                    },
                });
                return Promise.all([
                    AggregatesTree 
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'ipamAggregatesList.**',
                url: '/ipam_aggregates',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	