'use strict';
/*global app:true*/
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
    $routeProvider
      .when('/pdftest',{
        templateUrl:'views/pdftest.html',
        controller:'PdfController'
      })
      .when('/',{
        templateUrl:'views/principal.html',
        controller:'IndexCtrl'
      })
      .when('/create', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
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
        redirectTo: '/create'
      });
    // $locationProvider.html5Mode(true);
  });
