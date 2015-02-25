/*
 * Dependencies.
 */
var http = require('./http')
  , queue = require('./queue')
  , workers = require('./workers')
  , utils = require('./utils');

module.exports = init;

/**
 * Init function.
 * @return {object} Tinker module object.
 */
function init() {
  return {
    http: http,
    queue: queue,
    workers: workers,
    utils: utils
  };
}
