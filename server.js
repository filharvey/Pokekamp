var bodyParser = require('body-parser');
var express = require('express');
var app = express();

var config = require('./config.js');
var url = config.database;

if(config.port == 443) {
    var https = require('https').createServer(config.sslOptions, app);
}
else {
    var https = require('http').Server(app);
}
var io = require('socket.io')(https);



//express.js
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Use API
var api = require('./app/routes/api')(app, express, io);
app.use('/api', api);

app.get('*', function(req, res){
    res.sendFile(__dirname + '/public/app/views/index.html');
});

//the web-app is listening on specific port
https.listen(config.port, function(err) {
    if(err) {
        console.log("Could not initiate server at port " + config.port);
    }
    else {
        console.log("Server initiated at port " + config.port);
    }
});
