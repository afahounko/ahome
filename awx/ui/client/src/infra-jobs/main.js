/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/
import JobsList from './list/jobs-list.controller';
import JobsAdd from './add/jobs-add.controller';
import JobsEdit from './edit/jobs-edit.controller';
import JobBox from './jobs.box';
import JobForm from './jobs.form';
import JobList from './jobs.list';

import { N_ } from '../i18n';

export default
angular.module('infraJobsList', [])
   .controller('JobsList', JobsList)
   .controller('JobsAdd', JobsAdd)
   .controller('JobsEdit', JobsEdit)
   .factory('JobBox', JobBox)
   .factory('JobForm', JobForm)
   .factory('JobList', JobList)
   .config(['$stateProvider', 'stateDefinitionsProvider',
		function($stateProvider, stateDefinitionsProvider,) {
        	console.log("Job Main");
            let stateDefinitions = stateDefinitionsProvider.$get();

            function generateStateTree() {
            	console.log("Job Gen");
                let jobsTree = stateDefinitions.generateTree({
                    parent: 'infraJobsList',
                    modes: ['add', 'edit'],
                    box: 'JobBox',
                    list: 'JobList',
                    formss: 'JobForm',
                    modalDlg: true,
                    controllers: {
                        list: JobsList,
                        add: JobsAdd,
                       	edit: JobsEdit
                    },
                    data: {
                        activityStream: true,
                        activityStreamTarget: 'job'
                    },
	                ncyBreadcrumb: {
                        label: "{{infraJob}}",
						/*parent: function ($rootScope, $scope)
						{
							console.log('ncyBreadcrumb PARENT');
							console.log($rootScope);
							//console.log($window.localStorage.getItem('form_id'));
							console.log($scope);
      						return $scope.infraJob;
						}*/
                    },
                });
                return Promise.all([
                    jobsTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [])
                    };
                });
            }
            let stateTree = {
                name: 'infraJobsList.**',
                url: '/ipam_infrastructure_jobs',
                lazyLoad: () => generateStateTree(),
            };
            $stateProvider.state(stateTree);
        }
    ]);
            	