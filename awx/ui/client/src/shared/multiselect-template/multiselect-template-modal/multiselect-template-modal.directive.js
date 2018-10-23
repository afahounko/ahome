export default ['templateUrl', '$window', function(templateUrl, $window) {
    return {
        restrict: 'E',
        scope: {
            selectedVars: '='
        },
        templateUrl: templateUrl('shared/multiselect-template/multiselect-template-modal/multiselect-template-modal'),

        link: function(scope, element) {
			console.log('Multi Modal link function');
            $('#multiselect-template-modal').on('hidden.bs.modal', function () {
                $('#multiselect-template-modal').off('hidden.bs.modal');
                $(element).remove();
            });

            scope.showModal = function() {
                $('#multiselect-template-modal').modal('show');
            };

            scope.destroyModal = function() {
                $('#multiselect-template-modal').modal('hide');
            };
        },

        controller: ['$scope', '$compile', 'QuerySet', 'GetBasePath','generateList', 'MultiselectList', function($scope, $compile, qs, GetBasePath, GenerateList, MultiselectList) {

            function init() {

					let multiselectList = _.cloneDeep(MultiselectList);

                    $scope.multiselect_queryset = {
                        order_by: 'name',
                        page_size: 5
                    };

                    $scope.instance_group_default_params = {
                        order_by: 'name',
                        page_size: 5
                    };

                    qs.search(GetBasePath('hosts'), $scope.multiselect_queryset)
                        .then(res => {
                            $scope.multiselect_dataset = res.data;
                            $scope.multiselectLists = $scope.multiselect_dataset.results;

							console.log($scope.multiselectLists);
					        
					        //multiselectList.
                            multiselectList.multiSelectPreview = {
                                selectedRows: 'igTags',
                                availableRows: 'multiselectLists'
                            };
                            multiselectList.fields.name.ngClick = "linkoutInstanceGroup(instance_group)";

                            console.log(multiselectList);

                            let html = `${GenerateList.build({
                                list: multiselectList,
                                hideViewPerPage: true
                            })}`;

                            $scope.list = multiselectList;
                            $('#multiselect-template-modal-body').append($compile(html)($scope));

                            if ($scope.selectedVars) {
                                $scope.multiselectLists.map( (item) => {
                                    isSelected(item);
                                });
                            }

                            $scope.showModal();
                    });

                    $scope.$watch('multiselectLists', function(){
                        angular.forEach($scope.multiselectLists, function(tempRow) {
                            angular.forEach($scope.igTags, function(selectedRow){
                                if(selectedRow.id === tempRow.id) {
                                    tempRow.isSelected = true;
                                }
                            });
                        });
                    });

            }

            init();

            function isSelected(item) {
                if(_.find($scope.selectedVars, {id: item.id})){
                    item.isSelected = true;
                    if (!$scope.igTags) {
                        $scope.igTags = [];
                    }
                    $scope.igTags.push(item);
                }
                return item;
            }

            $scope.$on("selectedOrDeselected", function(e, value) {
                let item = value.value;
                if (value.isSelected) {
                    if(!$scope.igTags) {
                        $scope.igTags = [];
                    }
                    $scope.igTags.push(item);
                } else {
                    _.remove($scope.igTags, { id: item.id });
                }
            });

            $scope.linkoutInstanceGroup = function(param) {
                $window.open('/#/instance_groups/' + param.id + '/instances','_blank');
            };

            $scope.cancelForm = function() {
                $scope.destroyModal();
            };

            $scope.saveForm = function() {
                $scope.selectedVars = $scope.igTags;
                console.log($scope.selectedVars);
                $scope.destroyModal();
            };
        }]
    };
}];
