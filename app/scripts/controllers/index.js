'use strict';
/*global app:true*/
app.controller('IndexCtrl', function ($scope, Backend){
	Backend.query(function(res){
		$scope.recent = res;
		console.log($scope.recent);

	});

});