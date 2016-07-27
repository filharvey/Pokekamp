var fs = require("fs");
var constants = require("constants");

module.exports = {
    "database": "mongodb://localhost:27017/pokemongo_db",
    "port": process.env.PORT || 8080,
    "secretKey": "YourSecretKey",
    "maxThread": 100,
    "steps": 50,
    "sslOptions" : {
        key: fs.readFileSync(__dirname + '/certs/pokekamp.key'),
        cert: fs.readFileSync(__dirname + '/certs/2_pokekamp.us.crt'),
        ca: fs.readFileSync(__dirname + '/certs/1_Intermediate.crt'),
        root: fs.readFileSync(__dirname + '/certs/root.crt'),
        passphrase: "your key encryption passphrase",
        secureProtocol: 'SSLv23_method',
        honorCipherOrder: true,
        secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2
    }
}
