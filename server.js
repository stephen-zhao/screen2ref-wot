// set defaults for environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;

// imports
var bodyParser = require('body-parser');
var fs = require('fs');
var express = require('express');

// global configuration
var globalConfig = {
  port: port,
  wgAppID: '7c6bb9f5b4ebb263c4fecfe190103f40'
  // db: process.env.MONGOLAB_URI || 'mongodb://SAMPLE.mongolab.com:SAMPLE/SAMPLE',
  // dbUser: process.env.DB_USER || '',
  // dbPass: process.env.DB_PASS || '',
  // facebook: {
  //   clientID: 'SAMPLE',
  //   clientSecret: 'SAMPLE',
  //   callbackURL: 'http://localhost:'+ port +'/oauth/facebook/callback'
  // },
  // twitter: {
  //   clientID: 'SAMPLE',
  //   clientSecret: 'SAMPLE',
  //   callbackURL: 'http://localhost:'+ port +'/oauth/twitter/callback'
  // }
};

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
// TODO: more app routes

// start listen
app.listen(globalConfig.port);
console.log(process.env.NODE_ENV + ' server running at http://localhost:' + globalConfig.port);

// export for modularity
module.exports = app;
