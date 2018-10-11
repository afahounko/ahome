/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import PrefixesList from './list/prefixs-list.controller';
import PrefixesAdd from './add/prefixs-add.controller';
import PrefixesEdit from './edit/prefixs-edit.controller';
import PrefixForm from './prefixs.form';
import PrefixList from './prefixs.list';

import { N_ } from '../i18n';

export default
angular.module('ipamPrefixesList', [])
   .controller('PrefixesList', PrefixesList)
   .controller('PrefixesAdd', PrefixesAdd)
   .controller('PrefixesEdit', PrefixesEdit)
   .factory('PrefixForm', PrefixForm)
   .factory('PrefixList', PrefixList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let PrefixesTree = stateDefinitions.generateTree({
                    parent: 'ipamPrefixesList',
                    modes: ['add', 'edit'],
                    list: 'PrefixList',
                    form: 'PrefixForm',
                    controllers: {
                        list: PrefixesList,
                        add: PrefixesAdd,
                       	edit: PrefixesEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'prefix'
                    },
                    ncyBreadcrumb: {
                        label: N_('IPAM PREFIX')
                    },
                });
                return Promise.all([
                    PrefixesTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'ipamPrefixesList.**',
                url: '/ipam_prefixes',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	