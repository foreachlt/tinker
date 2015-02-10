var winston = require('winston')
  , logger;

// Create a new logger with custom config
logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      timestamp: true
    })
  ]
});

module.exports = logger;
