var Hipchat = require('node-hipchat')
  , cfg = require('../config');

module.exports = new Hipchat(cfg.hipchat.API_KEY);
