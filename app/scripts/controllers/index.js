'use strict';
/*global app:true*/
app.controller('IndexCtrl',['$scope','ExerciseBackend', function ($scope, ExerciseBackend){
	$scope.recent = [];
	var query = new Parse.Query('Exercise');
	query.limit(10);
	query.find({
		success: function(items){
			console.log(items);
			$scope.recent = items;
			$scope.$apply();

		},
		error: function(error){
			console.log(error);
		}
	});
}]);