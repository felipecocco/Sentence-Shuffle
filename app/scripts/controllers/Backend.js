'use strict';
/*global app:true*/
app.factory('UserBackend', function ($q, $rootScope){
  var User = Parse.User.extend({
  },{

  });
  var u;
  return {
    getExercises: function(){
      var defer = $q.defer();
      console.log('run');
      var query = new Parse.Query("Exercise");
      query.equalTo('owner',Parse.User.current());
      query.find({
        success: function(exercises){
          console.log(exercises);
          defer.resolve(exercises);
        },
        error: function(obj, error){
          console.log(error);
          defer.reject(error);
        }
      });
      return defer.promise;
    },
    signUp: function(username, password){
      console.log('signed');
      var defer = $q.defer();
      u = new User();
      u.set('username',username);
      u.set('password',password);
      u.signUp(null, {
        success:function(user){
          $rootScope.sessionUser = u;
          defer.resolve(user);
        },
        error: function(object, error){
          console.log(error )
          defer.reject(error);
        }
      });
      return defer.promise;
    },
    login: function(username, password){
      var defer = $q.defer();
      Parse.User.logIn(username,password, {
        success: function(user) {
          $rootScope.sessionUser = user;
          defer.resolve(user);
        },
        error: function(user, error) {
          defer.reject(error);
        }
      });
      return defer.promise;
    },
    logout: function(){
      Parse.User.logOut();
      $rootScope.sessionUser = Parse.User.current();
    }
  }
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
    Object.defineProperty(Exercise.prototype, "description", {
      get: function() {
        return this.get("description");
      },
      set: function(aValue) {
        this.set("description", aValue);
      }
    });
 
    return Exercise;
  });
app.factory('ExerciseAttempt', function ($q) {
 
    var ExerciseAttempt = Parse.Object.extend("exerciseAttempt", {
      initialize: function (attrs, options) {
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
    },
      find: function(exercise_key){
        var defer = $q.defer();
        var query = new Parse.Query(this);
        query.equalTo('exercise',exercise_key);
        query.find({
          success: function(results){
          defer.resolve(results);
        }, error: function(error){
          console.log(error);
          defer.resolve(error);
        }
      });
        return defer.promise;

  }
});
    // Title property
    Object.defineProperty(ExerciseAttempt.prototype, "exercise", {
      get: function() {
        return this.get("exercise");
      },
      set: function(aValue) {
        this.set("exercise", aValue);
      }
    });
    Object.defineProperty(ExerciseAttempt.prototype, "order", {
      get: function() {
        return this.get("order");
      },
      set: function(aValue) {
        this.set("order", aValue);
      }
    });
 
    return ExerciseAttempt;
  });