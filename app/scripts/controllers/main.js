'use strict';
/*global app:true*/
/*global $:false */
app.controller('MainCtrl', function ($scope, Backend, NGAnnotation, ParseBackend) {
  var testObject = new ParseBackend();
  testObject.set("title","Mickey");
    testObject.save(null, {
    success: function(object) {
      $(".success").show();
    },
    error: function(model, error) {
      $(".error").show();
      $scope.error = error;
    }
  });
  $scope.content='Insert your content here';
  $scope.stage = 0;
  $scope.demoTexts = ["something this way comes", "The Stockholm School of Economics (SSE) or Handelshögskolan i Stockholm (HHS) is one of the leading European business schools. SSE is a private business school that receives most of its financing from private sources. SSE offers bachelors, masters and MBA programs, along with highly regarded PhD programs and extensive Executive Education (customized and open programs).\r\rSSE's Masters in Management program is ranked no. 18 worldwide by the Financial Times.[1] QS ranks SSE no.26 among universities in the field of economics worldwide\r\rSSE is accredited by EQUIS certifying that all of its main activities, teaching as well as research, are of the highest international standards. SSE is also the Swedish member institution of CEMS together with universities such as London School of Economics, Copenhagen Business School, Tsinghua University, Bocconi University, HEC Paris and the University of St. Gallen.\r\rSSE has founded sister organizations: SSE Riga in Riga, Latvia, and SSE Russia in St Petersburg, Russia. It also operates a research institute in Tokyo, Japan; the EIJS (European Institute of Japanese Studies)."];
  $scope.annotations = [];
  $scope.sortables = [];
  $scope.original = [];
    $scope.radioModel = 'Element';
    $scope.transition = function(dir){
      if($scope.stage === 1 && dir === -1){
        console.log('oops');
        $scope.stage -= 1;
      }
      else{
        $scope.stage += dir;
      }
    }
    
    $scope.updateDatabase = function(){
      $scope.update(true);
      var toReturn = new Backend();
      $('#saveButton').html('Saving Now...');
      toReturn.items = $scope.sortables;
      toReturn.annotations = $scope.annotations;
      if($scope.radioModel === 'Element'){
        toReturn.kind = 'Paragraph';
      }
      else{
        toReturn.kind = $scope.radioModel;
      }
      toReturn.$save(
        function(){
          $('#saveButton').html('Saved!');
        },
        function(){
          $('#saveButton').html('something went wrong!');
        }
        );
    };
    $scope.update = function(creation){
      var str = $scope.content.replace(/(?:\r\n|\r|\n)/g, '<br>');
      if(str.length > 0){
        $('#final').html(str);
        $scope.pieces = $('#final').blast({delimiter:$scope.radioModel});
        $('#final span').filter(':even').css('color', '#0c5d99');
        $('#final span').filter(':odd').css('color', '#dd1f7b');
        $scope.sortables = [];
        $scope.original = [];
        if(creation != true){
          $scope.annotations = [];
        }
        for(var i = 0; i < $scope.pieces.length; i++){
          $scope.sortables.push({text: $scope.pieces[i].innerText, order: i});
          $scope.original.push($scope.pieces[i].innerText);
          if(creation != true){
            $scope.annotations.push([]);

          }
          
        }
      }
      else{
        $scope.sortables = [];
        $scope.annotations = [];
      }
    };
    $scope.checkActivity = function(){
      var display = $scope.sortables[0].text
      var toChange = display.substr(0,10);
      var newText = '<span class="ng-annotatetext-annotation ng-annotate-text-tyoe-blue">'+toChange+'</span>'
      $scope.sortables[0].text = display + newText;
      console.log($scope.sortables[0].text);
    }
    $scope.$watch('radioModel',function(){
      $scope.update();
    });
    $scope.$watch('content', function(){
      $scope.update();
    });
    $scope.onAnnotate = function($annotation) {
      console && console.log($annotation);
    };
    $scope.onAnnotateError = function($ex) {
      if ($ex.message === "NG_ANNOTATE_TEXT_PARTIAL_NODE_SELECTED") {
        return alert("Invalid selection.");
      } else {
        throw $ex;
      }
    };
    $scope.onPopupShow = function($el) {
      var firstInput;
      firstInput = $el.find("input, textarea").eq(0).focus();
      return firstInput && firstInput[0].select();
    };
    $scope.hasPoints = function(points) {
      var _isNaN;
      _isNaN = Number.isNaN || isNaN;
      return typeof points === "number" && points !== 0 && !_isNaN(points);
    };
    $scope.hasComment = function(comment) {
      return typeof comment === "string" && comment.length > 0;
    };
    $scope.annotationsAsFlatList = function(annotations) {
      if (annotations == null) {
        annotations = $scope.annotations[0];
      }
      if (!annotations.length) {
        return [];
      } else {
        return annotations.map(function(annotation) {
          var arr;
          arr = [];
          if ($scope.hasPoints(annotation.data.points) && $scope.hasComment(annotation.data.comment)) {
            arr.push(annotation);
          }
          if (annotation.children && annotation.children.length) {
            arr = arr.concat($scope.annotationsAsFlatList(annotation.children));
          }
          return arr;
        }).reduce(function(prev, current) {
          return prev.concat(current);
        });
      }
    };
    return $scope.clearPopups = function() {
      return $scope.$broadcast("ngAnnotateText.clearPopups");
    };
  });

app.factory('ParseBackend', function ($q) {
 
    var Presentation = Parse.Object.extend("Presentation", {
      initialize: function (attrs, options) {
          this.sound = "Rawr"
        }
    }, {
      // Class methods
    });
    // Title property
    Object.defineProperty(Presentation.prototype, "title", {
      get: function() {
        return this.get("title");
      },
      set: function(aValue) {
        this.set("title", aValue);
      }
    });
 
    return Presentation;
  });
app.factory('Backend', function ($resource){
  return $resource('http://felipecocco.appspot.com/api/exercise/:key');

});
