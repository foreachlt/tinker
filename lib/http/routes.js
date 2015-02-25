/**
 * Dependencies.
 */
var queue = require('../queue')
  , cc = require('../constants');

/**
 * Routes module.
 */
var routes = module.exports = {};

/**
 * Event route. Main endpoint for handling Github events.
 * @param {object} req Request object.
 * @param {object} res Response object.
 */
routes.event = function(req, res) {
  queue.create(cc.jobs.PR, { pr: req.body }).save(function(err) {
    if (!err) return res.status(201).end();

    return res.status(500).end();
  });
};
