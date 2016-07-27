angular.module('mainService', [])

.factory('Main', function($http) {
    var mainFactory = {};
    mainFactory.getPokemonCoords = function(baseLat, baseLng, baseAlt, username, password, provider, locationType, distance) {
        return $http.post('/api/initiateSearch', {
            'latitude': baseLat,
            'longitude': baseLng,
            'altitude': baseAlt,
            'username': username,
            'password': password,
            'provider': provider,
            'locationType': locationType,
            'distance': distance
        });
    }
    return mainFactory;
})

.factory('socketio', function($rootScope) {
    var socketio = io.connect();
    return {
        on: function(eventName, callback) {
            socketio.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function(){
                    callback.apply(socketio, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socketio.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.apply(function(){
                  if(callback) {
                    callbac.apply(socketio, args);
                  }
                });
            });
        }
    }
})
