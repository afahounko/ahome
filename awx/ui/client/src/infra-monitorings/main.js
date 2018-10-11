/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import MonitoringsList from './list/monitorings-list.controller';
import MonitoringsAdd from './add/monitorings-add.controller';
import MonitoringsEdit from './edit/monitorings-edit.controller';
import MonitoringBox from './monitorings.box';
import MonitoringForm from './monitorings.form';
import MonitoringList from './monitorings.list';

import { N_ } from '../i18n';

export default
angular.module('infraMonitoringsList', [])
   .controller('MonitoringsList', MonitoringsList)
   .controller('MonitoringsAdd', MonitoringsAdd)
   .controller('MonitoringsEdit', MonitoringsEdit)
   .factory('MonitoringBox', MonitoringBox)
   .factory('MonitoringForm', MonitoringForm)
   .factory('MonitoringList', MonitoringList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateProvider, stateDefinitionsProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get();

            function generateStateTree() {
                let monitoringsTree = stateDefinitions.generateTree({
                    parent: 'infraMonitoringsList',
                    modes: ['add', 'edit'],
                    box: 'MonitoringBox',
                    list: 'MonitoringList',
                    formss: 'MonitoringForm',
                    modalDlg: true,
                    controllers: {
                        list: MonitoringsList,
                        add: MonitoringsAdd,
                       	edit: MonitoringsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'monitoring'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA MONITORINGS')
                    },
                });
                return Promise.all([
                    monitoringsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraMonitoringsList.**',
                url: '/ipam_monitorings',
                lazyLoad: () => generateStateTree()
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	