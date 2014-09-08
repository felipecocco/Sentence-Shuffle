'use strict';
/*global app:true*/
/*global $:false */
app.controller('MainCtrl',['$scope','$routeParams','NGAnnotation','ExerciseBackend','$rootScope', function ($scope,$routeParams, NGAnnotation, ExerciseBackend,$rootScope) {
  $scope.content='Insert your content here';
  $scope.stage = 0;
  $scope.annotations = [];
  $scope.sortables = [];
  $scope.original = [];
  $scope.radioModel = 'Element';
  if($routeParams.exerciseKey)
  {
    console.log($routeParams.exerciseKey);
    ExerciseBackend.get($routeParams.exerciseKey).then(function(obj){
      var content = "";
      for(var i = 0; i < obj.sentences.length; i++){
        content += obj.sentences[i].text;
        content += "\n";
      }
      $scope.content = content;
      $scope.stage = 0;
      $scope.kind = obj.kind;
      $scope.activityTitle = obj.title;
    });
  }
  else{
    $scope.content='Insert your content here';
    $scope.stage = 0;
    $scope.annotations = [];
    $scope.sortables = [];
    $scope.original = [];
    $scope.radioModel = 'Element';

  }
  
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
      var testObject = new ExerciseBackend();
      $scope.update(true);
      $('#saveButton').html('Saving Now...');
      testObject.set("title",$scope.activityTitle);
      if($scope.radioModel === 'Element'){
        testObject.set("kind",'Paragraph');
      }
      else{
        testObject.set("kind",$scope.radioModel);
      }
      testObject.set("description",$scope.activityDescription);
      testObject.set("sentences",$scope.sortables);
      testObject.set("annotations",$scope.annotations);
      testObject.set("owner",$rootScope.sessionUser);
      testObject.save(null, {
        success: function(object){
          $('#saveButton').html('Saved!');
        },
        error: function(model,error){
          $('#saveButton').html('Oops!');
        }
      });
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
          console.log('2');
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
  }]);

