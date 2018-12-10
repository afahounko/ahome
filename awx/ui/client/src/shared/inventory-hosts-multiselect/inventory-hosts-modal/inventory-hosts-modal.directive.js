export default ['templateUrl', '$window', function(templateUrl, $window) {
    return {
        restrict: 'E',
        scope: {
            inventory_hosts: '=?bind'
        },
        templateUrl: templateUrl('shared/inventory-hosts-multiselect/inventory-hosts-modal/inventory-hosts-modal'),

        link: function(scope, element) {
			console.log('Multi Modal link function');
            $('#inventory-hosts-modal').on('hidden.bs.modal', function () {
                $('#inventory-hosts-modal').off('hidden.bs.modal');
                $(element).remove();
            });

            scope.showModal = function() {
                $('#inventory-hosts-modal').modal('show');
            };

            scope.destroyModal = function() {
                $('#inventory-hosts-modal').modal('hide');
            };
        },

        controller: ['$scope', '$compile', 'QuerySet', 'GetBasePath','generateList', 'MultiselectList', function($scope, $compile, qs, GetBasePath, GenerateList, MultiselectList) {

            function init() {

					let multiselectList = _.cloneDeep(MultiselectList);
					console.log('inventory-hosts-modal-dialog');
                    $scope.multiselect_queryset = {
                        order_by: 'name',
                        page_size: 5
                    };

                    $scope.multiselect_default_params = {
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
                            //multiselectList.fields.name.ngClick = "linkoutInstanceGroup(instance_group)";

                            console.log(multiselectList);

                            let html = `${GenerateList.build({
                                list: multiselectList,
                                hideViewPerPage: true
                            })}`;

                            $scope.list = multiselectList;
                            $('#inventory-hosts-modal-body').append($compile(html)($scope));

                            if ($scope.inventory_hosts) {
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
                if(_.find($scope.inventory_hosts, {id: item.id})){
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

//            $scope.linkoutInstanceGroup = function(param) {
//                $window.open('/#/instance_groups/' + param.id + '/instances','_blank');
//		    };

            $scope.cancelForm = function() {
                $scope.destroyModal();
            };

            $scope.saveForm = function() {
                $scope.inventory_hosts = $scope.igTags;
                console.log($scope.inventory_hosts);
                $scope.destroyModal();
            };
        }]
    };
}];
