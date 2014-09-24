app.controller('ForgotCtrl',['$scope','$rootScope','UserBackend','$location', function ($scope, $rootScope, UserBackend,$location){
	$scope.user = {}
	if($rootScope.sessionUser){
		$location.path('/myExercises');
	}
	$scope.recover = function(){
		$('#recoveryButton').html('Locating email...');
		console.log('clicked');
		Parse.User.requestPasswordReset($scope.user.email_add, {
		  success: function() {
		    $scope.recoveredEmail = true;
		    $scope.$apply();
		  },
		  error: function(error) {
		    // Show the error message somewhere
		    $scope.wrongEmail = true;
		    $scope.$apply();
		    console.log($scope.wrongEmail);
		    console.log("Error: " + error.code + " " + error.message);
		  }
		});
	}
}]);