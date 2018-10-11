/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import ServicesList from './list/services-list.controller';
import ServicesAdd from './add/services-add.controller';
import ServicesEdit from './edit/services-edit.controller';
import ServiceBox from './services.box';
import ServiceForm from './services.form';
import ServiceList from './services.list';

import { N_ } from '../i18n';

export default
angular.module('infraServicesList', [])
   .controller('ServicesList', ServicesList)
   .controller('ServicesAdd', ServicesAdd)
   .controller('ServicesEdit', ServicesEdit)
   .factory('ServiceBox', ServiceBox)
   .factory('ServiceForm', ServiceForm)
   .factory('ServiceList', ServiceList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();

            function generateStateTree() {
                let servicesTree = stateDefinitions.generateTree({
                    parent: 'infraServicesList',
                    modes: ['add', 'edit'],
                    box: 'ServiceBox',
                    list: 'ServiceList',
                    formss: 'ServiceForm',
                    modalDlg: true,
                    controllers: {
                        list: ServicesList,
                        add: ServicesAdd,
                       	edit: ServicesEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'service'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA SERVICES')
                    },
                });
                return Promise.all([
                    servicesTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraServicesList.**',
                url: '/ipam_services',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	