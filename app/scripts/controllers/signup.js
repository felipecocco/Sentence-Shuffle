'use strict';
/*global app:true*/
app.controller('SignupCtrl',['$scope','$rootScope','UserBackend','$location', function ($scope, $rootScope, UserBackend,$location){
	$scope.user = {}
	if($rootScope.sessionUser){
		$location.path('/myExercises');
	}
	$scope.signup = function(){
		console.log('clicked');
		var user = new Parse.User();
		user.set("username", $scope.user.email_add);
		user.set("password", $scope.user.password);
		user.set("email", $scope.user.email_add);
		 
		 
		user.signUp(null, {
		  success: function(user) {
		    $rootScope.sessionUser = user;
		    $scope.$apply(function(){$location.path('/myExercises')});

		  },
		  error: function(user, error) {
		    // Show the error message somewhere and let the user try again.
		    $scope.signUpError = true;
		    console.log("Error: " + error.code + " " + error.message);
		    $scope.$apply();
		  }
		});
	}
}]);