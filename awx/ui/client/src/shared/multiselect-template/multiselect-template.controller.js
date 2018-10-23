export default ['$scope',
    function($scope) {
		console.log('multi-sel controller');
		console.log($scope);
        $scope.multiselectTags = [];

        $scope.$watch('selectedVars', function() {
            $scope.multiselectTags = $scope.selectedVars;
            console.log($scope.multiselectTags);
        }, true);

        $scope.deleteTag = function(tag){
            _.remove($scope.selectedVars, {id: tag.id});
        };
    }
];