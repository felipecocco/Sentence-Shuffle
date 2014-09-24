'use strict';
/*global app:true*/
/*global jsPDF():true*/
app.controller('ExerciseCtrl',['$scope','$modal','$routeParams','$sce','NGAnnotation', 'ExerciseBackend', function ($scope,$modal, $routeParams,$sce, NGAnnotation,ExerciseBackend){
  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };
  $scope.score = [0];
  $scope.exercise = {};
  $scope.attempts = 0;
  ExerciseBackend.get($routeParams.exerciseKey).then(function(obj){
    console.log(obj);
    $scope.obj = obj
    $scope.notelength = obj.annotations.length;
    $scope.exercise.notes = [];
    $scope.exercise.title = obj.title;
    $scope.exercise.kind = obj.kind;
    $scope.exercise.sentences = shuffle(obj.sentences);
    
  });
  
  $scope.downloadWorksheet = function(){
    // @TODO: Need to simplify this demo

    var doc = new jsPDF('p','in','letter')
    , sizes = [12, 16, 20]
    , fonts = [['Times','Roman'],['Helvetica',''], ['Times','Italic']]
    , font, size, lines
    , margin = 2.0 // inches on a 8.5 x 11 inch sheet.
    , verticalOffset = margin;
    doc.setLineWidth(1/72).roundedRect(.1, .1, 8.3, 1.7,.1,.1);
    doc.setFontSize(24).text(3.5, 1, "Word Scrambler"); 


    // Margins:
    doc.setDrawColor(0, 255, 0)
      .setLineWidth(1/72)
      .setFontSize(10)
      var offset = 3
      doc.setDrawColor(0,0,0);
      for(var i = 0; i < $scope.exercise.sentences.length; i++){

        doc.text(1,offset,'_________');
        console.log($scope.exercise.sentences[i]);
        lines = doc.setFontSize(10).splitTextToSize($scope.exercise.sentences[i].text, 6.0);
        doc.roundedRect(margin-.1,offset-.2,6+.2,(lines.length/72)*10+.2, .1,.1);
        doc.text(margin,offset, lines);
        offset += ((lines.length/72)*10 + .5);
      }
      // .line(8.5 - margin, margin, 8.5-margin, 11-margin)

    // the 3 blocks of text
    // for (var i in fonts){
    //   if (fonts.hasOwnProperty(i)) {
    //     font = fonts[i]
    //     size = sizes[i]

    //     lines = doc.setFont(font[0], font[1])
    //           .setFontSize(size)
    //           .splitTextToSize(loremipsum, 7.5)
    //     // Don't want to preset font, size to calculate the lines?
    //     // .splitTextToSize(text, maxsize, options)
    //     // allows you to pass an object with any of the following:
    //     // {
    //     //  'fontSize': 12
    //     //  , 'fontStyle': 'Italic'
    //     //  , 'fontName': 'Times'
    //     // }
    //     // Without these, .splitTextToSize will use current / default
    //     // font Family, Style, Size.
    //     doc.text(0.5, verticalOffset + size / 72, lines)

    //     verticalOffset += (lines.length + 0.5) * size / 72
    //   }
    // }
    doc.save('Text Scrambler - ' + $scope.exercise.title);

  };
  $scope.calculateAttempt = function()
  {
    if($scope.attempts == 0){
      for (var item = 0; item < $scope.obj.annotations.length; item++){
        var itemNotes = [];
        for (var notes = 0; notes <$scope.obj.annotations[item].length; notes++){
          var thisNote = $scope.obj.annotations[item][notes];
          itemNotes.push(new NGAnnotation({
            startIndex: thisNote.startIndex,
            endIndex: thisNote.endIndex,
            type: thisNote.type,
            data: {
              comment: thisNote.data.comment
            }
            }));
        }
        $scope.exercise.notes.push(itemNotes);
      }
      $scope.exercise.annotations = $scope.exercise.notes;
      $scope.firstAttempt = angular.copy($scope.exercise.sentences);
      var exerciseAttempt = Parse.Object.extend("exerciseAttempt");
      var exerciseAttempt = new exerciseAttempt();
      var order = []; 
      exerciseAttempt.set("exercise", $routeParams.exerciseKey);

      for(var i = 0; i < $scope.exercise.sentences.length; i++){
        order.push($scope.exercise.sentences[i].order);
      }
      exerciseAttempt.set("order", order);
      exerciseAttempt.save();
    }
    $scope.attempts += 1;
    var score = 0;
    for(var i = 0; i < $scope.exercise.sentences.length; i++)
    {
      if(i == 0){
        if($scope.exercise.sentences[i].order == 0)
        {
          score += 1
        }
      }
      else if($scope.exercise.sentences[i].order === $scope.exercise.sentences[i-1].order + 1)
      {
        score+= 1;
      }
    }
    if(score == $scope.exercise.sentences.length){
      console.log('it is');
      $('#myModal').modal();
    }
    $scope.score.unshift(score);
  };
}]);
