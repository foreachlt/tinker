/**
 * Dependencies.
 */
var winston = require('winston');

/**
 * Logger module.
 */
module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      timestamp: true
    })
  ]
});
