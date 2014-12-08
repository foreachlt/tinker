var express = require('express')
  , kue = require('kue')
  , app = express()
  , cfg = require('./lib/config');

// Filters
// require('./lib/filters')(app);

// Routes
require('./lib/routes')(app);

// Kue
require('./lib/kue')(app);

// Start the server
app.listen(app.get('port'));
console.info('Server started on port', cfg.api.PORT);