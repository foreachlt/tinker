/**
 * Dependencies.
 */
var kue = require('kue');

var cfg = require('../config');

/**
 * Queue module.
 */
module.exports = kue.createQueue({
  redis: {
    port: cfg.redis.PORT,
    host: cfg.redis.HOST,
    auth: cfg.redis.AUTH
  }
});
