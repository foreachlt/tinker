var kue = require('kue')
  , cfg = require('../config')
  , queue = kue.createQueue({
      redis: {
        port: cfg.redis.PORT,
        host: cfg.redis.HOST,
        auth: cfg.redis.AUTH
      }
    });

module.exports = queue;
