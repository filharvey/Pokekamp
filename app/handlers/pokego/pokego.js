var PokemonGo = require('pokemon-go-node-api');
var io = require('socket.io');

module.exports = function(io) {
    var _me = {};

    _me.initiateSearch = function(req, res) {
        // Set variables
        var Pokeio = new PokemonGo.Pokeio();
        var location = {};
        if (req.body.locationType == 'coords') {
            location = {
                type: 'coords',
                coords: {
                    latitude: process.env.PGO_LATITUDE || parseFloat(req.body.latitude),
                    longitude: process.env.PGO_LONGITUDE || parseFloat(req.body.longitude),
                    altitude: process.env.PGO_ALTITUDE || parseFloat(req.body.altitude)
                }
            }
        }
        var username = process.env.PGO_USERNAME || req.body.username;
        var password = process.env.PGO_PASSWORD || req.body.password;
        var provider = process.env.PGO_PROVIDER || req.body.provider;
        if(!username || !password || !provider || !location) {
            var err = new Error("Some of the required variables were not provided!");
            throw err;
        }

        // Initialize PokemonGo search
        Pokeio.init(username, password, location, provider, function(err) {
            if (err) throw err;

            // Use io.emit('searchResponse', { message: '' }) to emit response
            io.emit('searchResponse', { message: '[i] Current location: ' + Pokeio.playerInfo.locationName });
            io.emit('searchResponse', { message: '[i] lat/long/alt: : ' + Pokeio.playerInfo.latitude + ' ' + Pokeio.playerInfo.longitude + ' ' + Pokeio.playerInfo.altitude });
            Pokeio.GetProfile(function(err, profile) {
                io.emit('searchResponse', { message: '[i] Username: ' + profile.username });
                io.emit('searchResponse', { message: '[i] Poke Storage: ' + profile.poke_storage });
                io.emit('searchResponse', { message: '[i] Item Storage: ' + profile.item_storage });
                Pokeio.Heartbeat(function(err, hb) {
                    if(err) {
                        console.log(err);
                    }
                    // For every cell returned
                    for (var i = hb.cells.length - 1; i >= 0; i--) {
                        var wildPokemons = hb.cells[i].WildPokemon;
                        var nearByPokemons = hb.cells[i].NearbyPokemon;

                        if(wildPokemons.length>0) {
                            // We have wild pokemons lets map them
                            wildPokemons.forEach(function(wildPokemon) {
                                var pokemonInfo = Pokeio.pokemonlist[wildPokemon.pokemon.PokemonId-1];
                                console.log('[+] There is a wild pokemon ' + pokemonInfo.name);
                                io.emit('foundPokemon', { pokemonInfo: pokemonInfo, latitude: wildPokemon.Latitude, longitude: wildPokemon.Longitude, time: wildPokemon.TimeTillHiddenMs, _id: wildPokemon.SpawnPointId });
                            })
                        }
                        if(nearByPokemons.length>0) {
                            nearByPokemons.forEach(function(nearByPokemon) {
                                var pokemonInfo = Pokeio.pokemonlist[nearByPokemon.PokedexNumber-1];
                                //console.log('[+] There is a ' + pokemonInfo.name + ' at ' + nearByPokemon.DistanceMeters.toString() + ' meters');
                                io.emit('searchResponse', { message: '[+] There is a ' + pokemonInfo.name + ' at ' + nearByPokemon.DistanceMeters.toString() + ' meters' });
                            })
                        }
                    }

                });
            });
        });
        res.send();
    }
    return _me;
}
