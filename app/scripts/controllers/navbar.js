'use strict';
/*global app:true*/
app.controller('NavbarCtrl',function ($scope, UserBackend){
	$scope.login = function(){
		var u = new UserBackend();
		u.set("username",$scope.username);
		u.set("password",$scope.password);
		u.signUp(null, {
		  success: function(user) {
		    console.log('hooray');
		  },
		  error: function(user, error) {
		    // Show the error message somewhere and let the user try again.
		    console.log("Error: " + error.code + " " + error.message);
		  }
		});

	}

});