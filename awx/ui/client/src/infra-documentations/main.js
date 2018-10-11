/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import DocumentationsList from './list/documentations-list.controller';
import DocumentationsAdd from './add/documentations-add.controller';
import DocumentationsEdit from './edit/documentations-edit.controller';
import DocumentationBox from './documentations.box';
import DocumentationForm from './documentations.form';
import DocumentationList from './documentations.list';

import { N_ } from '../i18n';

export default
angular.module('infraDocumentationsList', [])
   .controller('DocumentationsList', DocumentationsList)
   .controller('DocumentationsAdd', DocumentationsAdd)
   .controller('DocumentationsEdit', DocumentationsEdit)
   .factory('DocumentationBox', DocumentationBox)
   .factory('DocumentationForm', DocumentationForm)
   .factory('DocumentationList', DocumentationList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
        function($stateDocumentation, stateDefinitionsDocumentation) {
            let stateDefinitions = stateDefinitionsDocumentation.$get();
			console.log("Documentation Main");
            function generateStateTree() {
                let DocumentationsTree = stateDefinitions.generateTree({
                    parent: 'infraDocumentationsList',
                    modes: ['add', 'edit'],
                    box: 'DocumentationBox',
                    list: 'DocumentationList',
                    formss: 'DocumentationForm',
                    modalDlg: true,
                    controllers: {
                        list: DocumentationsList,
                        add: DocumentationsAdd,
                       	edit: DocumentationsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'documentation'
                    },
                    ncyBreadcrumb: { 
                        label: N_('INFRA MONITOR')
                    },
                });
                return Promise.all([
                    DocumentationsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraDocumentationsList.**',
                url: '/ipam_documentations',
                lazyLoad: () => generateStateTree()
            };
            $stateDocumentation.state(stateTree);
        }
    ]);
            	