angular.module('mainCtrl', ['mainService'])

.controller('MainController', function($rootScope, $location, $log, $timeout, Main, uiGmapGoogleMapApi, socketio) {
    console.log("In main controller");
    var vm = this;
    vm.errorMsg = "";
    vm.baseLat = 22.601781;
    vm.baseLng = 88.373679;
    vm.distance = 3; // Distance in kilometer
    vm.distanceOpts = [0.3, 0.5, 1, 3, 5, 7, 10];
    vm.queryMessage = "";
    vm.buttonDisabled = false;
    vm.consoleResponse = ["Console Response"];
    vm.username = "";
    vm.password = "";
    vm.provider = "";
    vm.providers = ["google", "pokego"];
    vm.locationType = "coords";
    vm.wildPokemons = [];

    vm.map = { center: { latitude: vm.baseLat, longitude: vm.baseLng }, zoom: 17 };

    $rootScope.$on('$routeChangeStart', function() { //Is the route changing?
    });

    vm.getInitialPage = function() {
        $location.path('/');
    }
    vm.enableButton = function() {
        vm.buttonDisabled = false;
    }
    /* geoService */
    vm.geoSuccess = function(position) {
        vm.baseLat = position.coords.latitude;
        vm.baseLng = position.coords.longitude;
        console.log("Got position");
        vm.errorMsg = null;
    }
    vm.geoError = function(error) {
        vm.errorMsg = error.message;
        vm.baseLat = 0;
        vm.baseLng = 0;
    }
    vm.geoOptions = {
        timeout: 5000,
        maximumAge: 5 * 60 * 1000
    }
    vm.getMyLocation = function() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(vm.geoSuccess, vm.geoError, vm.geoOptions);
        }
    }

    vm.showPokemons = function() {
        vm.buttonDisabled = true;
        vm.markers = [];
        $timeout(vm.enableButton, 5000);
        vm.markers = [];
        vm.map = { center: { latitude: vm.baseLat, longitude: vm.baseLng }, zoom: 17 };

        var marker = {
          id: 0,
          coords: {
            latitude: vm.baseLat,
            longitude: vm.baseLng
          },
          options: {
              draggable: false,
              labelContent: "You",
              labelAnchor: "0 0",
              labelClass: "marker-labels"
          },
          events: {}
        };
        vm.markers.push(marker);
        Main.getPokemonCoords(vm.baseLat, vm.baseLng, vm.baseAlt, vm.username, vm.password, vm.provider, vm.locationType, vm.distance)
            .success(function(data) {
                if(data) {
                    data.pokemons.forEach(function(pokemon) {
                        var marker = {
                            id: pokemon._id,
                            coords: {
                                latitude: pokemon.location[0],
                                longitude: pokemon.location[1]
                            },
                            options: {
                                draggable: false,
                                icon: '/app/views/icons/' + pokemon.pokeID + '.png'
                            },
                            events: {}
                        };
                        vm.markers.push(marker);
                    })
                    if (data.message) {
                        vm.queryMessage = data.message;
                    }
                    else {
                        vm.queryMessage = "";
                    }
                }
            });
    }

    // Socket functions for realtime output
    socketio.on('searchResponse', function(data) {
        //console.log(data);
        vm.consoleResponse.push(data.message);
    })
    socketio.on('foundPokemon', function(data) {
        // Create pokemon
        var pokemonMarker = {
            id: data._id,
            coords: {
                latitude: data.latitude,
                longitude: data.longitude
            },
            options: {
                draggable: false,
                icon: '/app/views/icons/' + data.pokemonInfo.id + '.png',
                title: data.pokemonInfo.name
            },
            events: {}
        };
        vm.markers.push(pokemonMarker);
    })
})
