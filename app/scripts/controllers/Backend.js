'use strict';
/*global app:true*/
app.factory('UserBackend', function ($q){
  var User = Parse.User.extend({

  },{

  });
  return User;
});
app.factory('ExerciseBackend', function ($q) {
 
    var Exercise = Parse.Object.extend("Exercise", {
      initialize: function (attrs, options) {
          this.sound = "Rawr"
        }
    }, {
      // Class methods
      get: function (id){
        var defer = $q.defer();
        var query = new Parse.Query(this);
        query.get(id, {
          success: function(item){
            defer.resolve(item);
          },
          error: function(object,aError){
            defer.reject(aError);
          }
      });
      return defer.promise;
    }
  });
    // Title property
    Object.defineProperty(Exercise.prototype, "title", {
      get: function() {
        return this.get("title");
      },
      set: function(aValue) {
        this.set("title", aValue);
      }
    });
    Object.defineProperty(Exercise.prototype, "annotations", {
      get: function() {
        return this.get("annotations");
      },
      set: function(aValue) {
        this.set("annotations", aValue);
      }
    });
    Object.defineProperty(Exercise.prototype, "sentences", {
      get: function() {
        return this.get("sentences");
      },
      set: function(aValue) {
        this.set("sentences", aValue);
      }
    });
 
    return Exercise;
  });