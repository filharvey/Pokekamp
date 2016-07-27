var config = require('../../config.js');
var secretKey = config.secretKey;
var http = require("http");

module.exports = function(app, express, io) {
    var api = express.Router();

    // Modules using socket
    var pokegosearch = require('../handlers/pokego/pokego.js')(io);
    api.post('/initiateSearch', pokegosearch.initiateSearch);

    return api;
}
