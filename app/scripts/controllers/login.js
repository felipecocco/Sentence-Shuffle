
app.controller('LoginCtrl',['$scope','$rootScope','UserBackend','$location', function ($scope, $rootScope, UserBackend,$location){
	$scope.user = {}
	if($rootScope.sessionUser){
		$location.path('/myExercises');
	}
	$scope.login = function(){
		Parse.User.logIn($scope.user.email_add,$scope.user.password, {
		  success: function(user) {
		    $rootScope.sessionUser = user;
		    $scope.$apply(function(){$location.path('/myExercises')});
		  },
		  error: function(user, error){
		  	$scope.loginError = true;
		  	$scope.$apply();
		  }
		});
	}
}]);