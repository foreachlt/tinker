var express = require('express')
  , app = express()
  , logger = require('../utils/logger')
  , cfg = require('../config');

// Filters
require('./filters')(app);

// Routes
require('./routes')(app);

module.exports = function() {
  // Start the server
  app.listen(cfg.api.PORT);
  logger.info('Server started on port', cfg.api.PORT);
};
