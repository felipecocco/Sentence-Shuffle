app.controller('LiveCtrl', function ($routeParams,$scope, $rootScope,UserBackend,ExerciseBackend, ExerciseAttempt, NGAnnotation){
	
	$scope.exercise = {};
	$scope.results = [];
	$scope.resultsArray = [];
	ExerciseBackend.get($routeParams.exerciseKey).then(function(obj){
	  console.log(obj);
	  $scope.notelength = obj.annotations.length;
	  $scope.exercise.notes = [];
	  $scope.exercise.title = obj.title;
	  $scope.exercise.kind = obj.kind;
	  $scope.exercise.sentences = obj.sentences;
	  for (var item = 0; item < obj.annotations.length; item++){
	    var itemNotes = [];
	    for (var notes = 0; notes <obj.annotations[item].length; notes++){
	      var thisNote = obj.annotations[item][notes];
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
	});
	ExerciseAttempt.find($routeParams.exerciseKey).then(function(results){
		console.log(results);
		$scope.resultsArray = [];
		for(var i = 0; i <= results[0].order.length; i++){
			$scope.resultsArray.push(Array.apply(null, new Array(results[0].order.length+1)).map(Number.prototype.valueOf,0));
		}
		$scope.results = results;
		for(var solution = 0; solution < results.length; solution++){
			for(var paragraph = 0; paragraph < results[solution].order.length; paragraph++){
				if(paragraph == 0){
					$scope.resultsArray[0][results[solution].order[paragraph]+1] += 1;
				}
				else{
					$scope.resultsArray[results[solution].order[paragraph-1]+1][results[solution].order[paragraph]+1] += 1;
				}
			}
		}
		console.log($scope.resultsArray);
		var matrix = $scope.resultsArray;

		var chord = d3.layout.chord()
		    .padding(.20)
		    .sortSubgroups(d3.ascending)
		    .matrix(matrix);

		var width = 960,
		    height = 500,
		    innerRadius = Math.min(width, height) * .41,
		    outerRadius = innerRadius * 1.1;

		var fill = d3.scale.ordinal()
		    .domain(d3.range(6))
		    .range(["#000000", "#FFDD89", "#957244", "#F26223", "#00FF00", "#000000"]);

		var svg = d3.select("#chart").append("svg")
		    .attr("width", width)
		    .attr("height", height)
		  .append("g")
		    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		svg.append("g").selectAll("path")
		    .data(chord.groups)
		  .enter().append("path")
		    .style("fill", function(d) { return fill(d.index); })
		    .style("stroke", function(d) { return fill(d.index); })
		    .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
		    .on("mouseover", fade(.1))
		    .on("mouseout", fade(1));

		var ticks = svg.append("g").selectAll("g")
		    .data(chord.groups)
		  .enter().append("g").selectAll("g")
		    .data(groupTicks)
		  .enter().append("g")
		    .attr("transform", function(d) {
		      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		          + "translate(" + outerRadius + ",0)";
		    });

		// ticks.append("line")
		//     .attr("x1", 1)
		//     .attr("y1", 0)
		//     .attr("x2", 5)
		//     .attr("y2", 0)
		//     .style("stroke", "#000");

		// ticks.append("text")
		//     .attr("x", 8)
		//     .attr("dy", ".35em")
		//     .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
		//     .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		//     .text(function(d) { return d.label; });

		svg.append("g")
		    .attr("class", "chord")
		  .selectAll("path")
		    .data(chord.chords)
		  .enter().append("path")
		    .attr("d", d3.svg.chord().radius(innerRadius))
		    .style("fill", function(d) { return fill(d.target.index); })
		    .style("opacity", 1);

		// Returns an array of tick angles and labels, given a group.
		function groupTicks(d) {
		  var k = (d.endAngle - d.startAngle) / d.value;
		  return d3.range(0, d.value, 1000).map(function(v, i) {
		    return {
		      angle: v * k + d.startAngle,
		      label: i % 5 ? null : v / 1000 + "k"
		    };
		  });
		}

		// Returns an event handler for fading a given chord group.
		function fade(opacity) {
		  return function(g, i) {
		    svg.selectAll(".chord path")
		        .filter(function(d) { return d.source.index != i && d.target.index != i; })
		      .transition()
		        .style("opacity", opacity);
		  };
		}

		
	});
	// var matrix = $scope.resultsArray;
	
	


});