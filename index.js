var express = require('express')
  , app = express()
  , cfg = require('./lib/config');

// Filters
require('./lib/filters')(app);

// Routes
require('./lib/routes')(app);

// Kue
require('./lib/kue')(app);

// Start the server
app.listen(cfg.api.PORT);
console.info('Server started on port', cfg.api.PORT);
