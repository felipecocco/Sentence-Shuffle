'use strict';
/*global app:true*/
app.controller('NavbarCtrl',['$scope','$rootScope','UserBackend','$location', function ($scope, $rootScope, UserBackend, $location){
	$scope.login = function(){
		Parse.User.logIn($scope.username,$scope.password, {
		  success: function(user) {
		    $rootScope.sessionUser = user;
		    $scope.$apply(function(){$location.path('/myExercises')});
		  },
		  error: function(user, error) {
		  	$.iGrowl({
		  		icon: 'iconFeather-featherCross',
		  		type: 'error',
		  		small:'true',
		  		title:'Login Error',
		  		message: "The login information you entered is invalid. If you forgot your password, <a href='#/forgot'>click here</a>!",
		  		delay: 10000,
		  		placement:{
		  			x: 'left',
		  			y: 'top'
		  		}
		  	});
		  }
		});
	}
	$scope.logout = function(){
		UserBackend.logout();
	}

}]);