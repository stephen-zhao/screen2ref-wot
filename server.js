// set defaults for environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// imports
var config = require('./app/config.js');
var bodyParser = require('body-parser');
var fs = require('fs');
var express = require('express');
var mysql = require('mysql');
var http = require('http');
var https = require('https');
var wotproc = require('./app/WoTProcessing.js');

// express init
var app = express();

// express configs
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/', express.static('./public'));

// app routes
app.get('/api/battleTiers', function(req, res) {
  fs.readFile('./app/battleTiers.json', function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});
app.get('/api/battleTiersSpecial', function(req, res) {
  res.json(require('./app/battleTiersSpecial.js'));
  // fs.readFile('./app/battleTiersSpecial.js', function(err, data) {
  //   if (err) {
  //     console.error(err);
  //     process.exit(1);
  //   }
  //   res.json(JSON.parse(data));
  // });
});
app.get('/api/vehicleTopConfigs', function(req, res) {
  var connection = mysql.createConnection(config.dbConnectionOptions);
  connection.connect();
  var sql = 
      'SELECT profile_data FROM vehicle_profile';
    var values = [tank_id, profile_id, profile_data];
    connection.query(sql, [
        values, 
        mysql.escape(values[0]), 
        mysql.escape(values[2])
        ], 
    function(err, res) {
      if (err) throw err;
      connection.end(function(err) {
        console.log('Added vehicle profile', profile_id,'to database.');
      });
    });
    // TODO: make this API endpoint work, then make client pull from this API endpoint
});
// TODO: more app routes


if (config.updateDbOnStart) {
  console.log('UPDATE_DB flag set: Updating database of vehicle configurations.')
  var wgWotVehicleApi = 'https://api.worldoftanks.com/wot/encyclopedia/vehicles/'+
    '?application_id='+config.wgAppID;
  console.log('Making GET request to:', wgWotVehicleApi);
  // get vehicles from WG API & process them
  https.get(wgWotVehicleApi, function(res) {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
    var body = '';
    res.on('data', (d) => { body += d; });
    res.on('end', () => { wotproc.processVehicles(JSON.parse(body), true); });
  });
}


// start listen
app.listen(config.port);
console.log(process.env.NODE_ENV + ' server running at http://localhost:' + config.port);

// export for modularity
module.exports = app;
