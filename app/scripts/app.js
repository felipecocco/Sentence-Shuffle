'use strict';
/*global app:true*/
var loginRequired = function($location, $q, $rootScope) {  
    var deferred = $q.defer();

    if(!$rootScope.sessionUser) {
        deferred.reject()
        $location.path('/');
    } else {
        deferred.resolve()
    }

    return deferred.promise;
}
var app = angular.module('frontendApp', [
  'ngCookies',
  'ngResource',
  'ngAudio',
  'ngAnnotateText',
  'ngSanitize',
  'ngRoute',
  'ui.sortable',
  'ui.bootstrap'
]);
app.config(function ($routeProvider, $locationProvider) {
    Parse.initialize("nH0BiYugmVyCNDLHFYGBuPdUJyBLRAOMBH9DYYuw", "jHLNGNDIBFXlUak1aLhZCEnqBeq2vjUhnRQ9UusB");
    $routeProvider
      .when('/pdftest',{
        templateUrl:'views/pdftest.html',
        controller:'PdfController'
      })
      .when('/',{
        templateUrl:'views/principal.html',
        controller:'IndexCtrl'
      })
      .when('/create/:exerciseKey?', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve:{loginRequired: loginRequired}
      })
      .when('/live/:exerciseKey',{
        templateUrl: '/views/liveview.html',
        controller:'LiveCtrl',
        resolve:{loginRequired: loginRequired}
      })
      .when('/myExercises',{
        templateUrl: '/views/myexercises.html',
        controller: 'MyExercisesCtrl',
        resolve:{loginRequired: loginRequired}
      })
      .when('/checkStep',{
        templateUrl: '/views/confirmation.html',
        controller: 'ConfirmationCtrl'
      })
      .when('/exercise/:exerciseKey',{
        templateUrl: '/views/exercise.html',
        controller: 'ExerciseCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    // $locationProvider.html5Mode(true);
  });
app.run(function ($rootScope){
  $rootScope.sessionUser = Parse.User.current();
});
