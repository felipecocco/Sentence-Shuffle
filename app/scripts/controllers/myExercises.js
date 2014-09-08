app.controller('MyExercisesCtrl',['$scope','$rootScope','UserBackend','ExerciseBackend', function ($scope, $rootScope,UserBackend,ExerciseBackend){
	UserBackend.getExercises().then(function(result){
		$scope.exercises = result;
		console.log($scope.exercises[0]);
	});


}]);