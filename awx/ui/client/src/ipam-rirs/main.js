/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import RirsList from './list/rirs-list.controller';
import RirsAdd from './add/rirs-add.controller';
import RirsEdit from './edit/rirs-edit.controller';
import RirForm from './rirs.form';
import RirList from './rirs.list';

import { N_ } from '../i18n';

export default
angular.module('ipamRirsList', [])
   .controller('RirsList', RirsList)
   .controller('RirsAdd', RirsAdd)
   .controller('RirsEdit', RirsEdit)
   .factory('RirForm', RirForm)
   .factory('RirList', RirList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let rirsTree = stateDefinitions.generateTree({
                    parent: 'ipamRirsList',
                    modes: ['add', 'edit'],
                    list: 'RirList',
                    form: 'RirForm',
                    controllers: {
                        list: RirsList,
                        add: RirsAdd,
                       	edit: RirsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'rir'
                    },
                    ncyBreadcrumb: {
                        label: N_('IPAM RIRS')
                    },
                });
                return Promise.all([
                    rirsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'ipamRirsList.**',
                url: '/ipam_rirs',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	