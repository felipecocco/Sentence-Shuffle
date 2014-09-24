'use strict';
/*global app:true*/
var loginRequired = function($location, $q, $rootScope) {  
    var deferred = $q.defer();

    if(!$rootScope.sessionUser) {
        deferred.reject()
        $location.path('/signup');
    } else {
        deferred.resolve()
    }

    return deferred.promise;
}
var app = angular.module('frontendApp', [
  'ngCookies',
  'angular-loading-bar',
  'ngResource',
  'ngAnnotateText',
  'ngSanitize',
  'ngRoute',
  'ui.sortable',
  'ui.bootstrap'
]);
app.config(function (cfpLoadingBarProvider, $routeProvider, $locationProvider) {
    cfpLoadingBarProvider.latencyThreshold = 10;
    Parse.initialize("OUU8h8AVe2mvNWLeT0aSOUZweL0Ku4uaU5xnCI0g", "bhYqJ9b4wy2xseVo6U5zMy8Y7rQAoDtJVsObXpNH");
    $routeProvider
      .when('/pdftest',{
        templateUrl:'views/pdftest.html',
        controller:'PdfController'
      })
      .when('/login',{
        templateUrl:'views/login.html',
        controller:'LoginCtrl'
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
      .when('/forgot',{
        templateUrl:'views/forgot.html',
        controller: 'ForgotCtrl'
      })
      .when('/signup',{
        templateUrl:'views/signup.html',
        controller:'SignupCtrl'
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
