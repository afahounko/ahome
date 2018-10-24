export default ['$scope',
    function($scope) {
		console.log('multi-sel controller');
		console.log($scope);
        $scope.multiselectTags = [];

        $scope.$watch('inventory_hosts', function() {
            $scope.multiselectTags = $scope.inventory_hosts;
            console.log($scope.multiselectTags);
        }, true);

        $scope.deleteTag = function(tag){
            _.remove($scope.inventory_hosts, {id: tag.id});
        };
    }
];