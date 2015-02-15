var express = require('express')
  , app = express()
  , logger = require('./lib/utils/logger')
  , cfg = require('./lib/config');

// Filters
require('./lib/filters')(app);

// Routes
require('./lib/routes')(app);

// Start the server
app.listen(cfg.api.PORT);
logger.info('Server started on port', cfg.api.PORT);
