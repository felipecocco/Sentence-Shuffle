'use strict';
/*global app:true*/
app.controller('NavbarCtrl',['$scope','$rootScope','UserBackend', function ($scope, $rootScope, UserBackend){
	$scope.login = function(){
		UserBackend.login($scope.username,$scope.password).then(function(obj){
			console.log(obj);
		})
	}
	$scope.signup = function(){
		console.log('called');
		UserBackend.signUp($scope.username,$scope.password).then(function(obj){
			console.log(obj);
		});
		// var u = new UserBackend();
		// u.set("username",$scope.username);
		// u.set("password",$scope.password);
		// u.signUp(null, {
		//   success: function(user) {
		//     console.log('hooray');
		//   },
		//   error: function(user, error) {
		//     // Show the error message somewhere and let the user try again.
		//     console.log("Error: " + error.code + " " + error.message);
		//   }
		// });

	}
	$scope.logout = function(){
		UserBackend.logout();
	}

}]);