app.controller('MyExercisesCtrl',['$scope','$rootScope','UserBackend','ExerciseBackend', function ($scope, $rootScope,UserBackend,ExerciseBackend){
	UserBackend.getExercises().then(function(result){
		$scope.exercises = result;
		console.log($scope.exercises[0]);
	});
	$scope.delete = function(index){
		if($scope.exercises[index].owner == $rootScope.userSession){
			$scope.exercises[index].destroy({
				success: function (exercise){
					console.log('sucessfully deleted it');
					$scope.exercises.splice(index);
					$scope.$apply();
				},
				error: function(object, error){
					console.log('error');
				}
			});

		}

	}


}]);