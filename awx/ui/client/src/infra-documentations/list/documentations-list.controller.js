/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

export default ['$window', '$scope', '$rootScope', 'Rest', 'DocumentationList', 'Prompt',
    'ProcessErrors', 'GetBasePath', 'Wait', '$state', '$filter',
    'rbacUiControlService', 'Dataset', 'i18n', 
    function($window, $scope, $rootScope, Rest, DocumentationList, Prompt,
    ProcessErrors, GetBasePath, Wait, $state, $filter, rbacUiControlService,
    Dataset, i18n) {

        var list = DocumentationList,
        defaultUrl = GetBasePath('ipam_documentations');

        init();

        function init() {

            $scope.canAdd = false;
            
            rbacUiControlService.canAdd('ipam_documentations')
                .then(function(params) {
                    $scope.canAdd = params.canAdd;
                });
                
            // search init
            $scope.list = list;
            $scope[`${list.iterator}_dataset`] = Dataset.data;
            $scope[list.name] = $scope[`${list.iterator}_dataset`].results;

            $rootScope.flashMessage = null;
            $scope.selected = [];
        }

        $scope.addNew = function(param) {
            console.log("Add Documentation infraDocumentation" + param);
            $window.localStorage.setItem('form_id', param);
            $state.go('infraDocumentationsList.add_' + param);
        };
        
        $scope.infraJobs= function() {
        	console.log("********* Launch ************");
        	//var locationTo = 'infraJobsList.documentations.' + this.documentation.related.opts.id_type;
        	//console.log(locationTo);
        	$window.localStorage.setItem('fk_model', 'documentations');
        	$window.localStorage.setItem('fk_type', this.documentation.related.opts.id_type);
        	$window.localStorage.setItem('fk_id', this.documentation.id);
            $state.go('infraJobsList');
			console.log("State Go finished");
        };
        
        $scope.launchDocumentation= function() {
        	console.log("Launch");
            //$rootScope.form_id = this.documentation.related.opts.id_type;
            //$state.go('infraJobsList', null, { reload: true});
        };

        $scope.editDocumentation= function() {
        	console.log("stateGO");
            console.log('infraDocumentationsList.edit_' + this.documentation.related.opts.id_type);
            $window.localStorage.setItem('form_id', this.documentation.related.opts.id_type);
            $state.go('infraDocumentationsList.edit_' + this.documentation.related.opts.id_type, { documentation_id: this.documentation.id });
        };

        $scope.deleteDocumentation = function(id, name) {
            var action = function() {
                $('#prompt-modal').modal('hide');
                Wait('start');
                var url = defaultUrl + id + '/';
                Rest.setUrl(url);
                Rest.destroy()
                    .then(() => {
                        let reloadListStateParams = null;

                        if($scope.ipam_documentations.length === 1 && $state.params.documentation_search && !_.isEmpty($state.params.documentation_search.page) && $state.params.documentation_search.page !== '1') {
                            reloadListStateParams = _.cloneDeep($state.params);
                            reloadListStateParams.documentation_search.page = (parseInt(reloadListStateParams.documentation_search.page)-1).toString();
                        }

                        if (parseInt($state.params.documentation_id) === id) {
                            $state.go('^', null, { reload: true });
                        } else {
                            $state.go('.', null, { reload: true });
                        }
                    })
                    .catch(({data, status}) => {
                        ProcessErrors($scope, data, status, null, {
                            hdr: i18n._('Error!'),
                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE returned status: '), url) + status
                        });
                    });
            };

            Prompt({
                hdr: i18n._('Delete'),
                resourceName: $filter('sanitize')(name),
                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Documentation?') + '</div>',
                action: action,
                actionText: i18n._('DELETE')
            });
        };
    }
];
