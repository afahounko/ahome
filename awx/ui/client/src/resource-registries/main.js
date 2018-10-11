/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import RegistriesList from './list/registries-list.controller';
import RegistriesAdd from './add/registries-add.controller';
import RegistriesEdit from './edit/registries-edit.controller';
import RegistryForm from './registry.form';
import RegistryList from './registry.list';

import { N_ } from '../i18n';

export default
angular.module('resourceRegistriesList', [])
   .controller('RegistriesList', RegistriesList)
   .controller('RegistriesAdd', RegistriesAdd)
   .controller('RegistriesEdit', RegistriesEdit)
   .factory('RegistryForm', RegistryForm)
   .factory('RegistryList', RegistryList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();


            function generateStateTree() {
                let registriesTree = stateDefinitions.generateTree({
                    parent: 'resourceRegistriesList',
                    modes: ['add', 'edit'],
                    list: 'RegistryList',
                    form: 'RegistryForm',
                    controllers: {
                        list: RegistriesList,
                        add: RegistriesAdd,
                       	edit: RegistriesEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'registry'
                    },
                    ncyBreadcrumb: {
                        label: N_('Registries')
                    },
                });
                return Promise.all([
                    registriesTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'resourceRegistriesList.**',
                url: '/ipam_registries',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	