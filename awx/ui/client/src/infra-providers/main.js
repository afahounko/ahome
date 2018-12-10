/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import ProvidersList from './list/providers-list.controller';
import ProvidersAdd from './add/providers-add.controller';
import ProvidersEdit from './edit/providers-edit.controller';
import ProviderBox from './providers.box';
import ProviderForm from './providers.form';
import ProviderList from './providers.list';

import { N_ } from '../i18n';

export default
angular.module('infraProvidersList', [])
   .controller('ProvidersList', ProvidersList)
   .controller('ProvidersAdd', ProvidersAdd)
   .controller('ProvidersEdit', ProvidersEdit)
   .factory('ProviderBox', ProviderBox)
   .factory('ProviderForm', ProviderForm)
   .factory('ProviderList', ProviderList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();
			console.log("Provider Main");
            function generateStateTree() {
                let ProvidersTree = stateDefinitions.generateTree({
                    parent: 'infraProvidersList',
                    modes: ['add', 'edit'],
                    box: 'ProviderBox',
                    list: 'ProviderList',
                    formss: 'ProviderForm',
                    modalDlg: true,
                    controllers: {
                        list: ProvidersList,
                        add: ProvidersAdd,
                       	edit: ProvidersEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'provider'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA PROVIDERS')
                    },
                });
                return Promise.all([
                    ProvidersTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraProvidersList.**',
                url: '/ipam_providers',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	