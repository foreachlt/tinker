/**
 * Dependencies.
 */
var crypto = require('crypto')
  , cfg = require('../config');

/**
 * Middleware module.
 */
var middleware = module.exports = {};

/**
 * A middleware for validating Github event.
 * @param {object} req Request object.
 * @param {object} res Response object.
 * @param {function} next Next middleware function.
 *
 * @return {*} Return next middleware or respond with 400.
 */
middleware.githubEvent = function(req, res, next) {
  var event = req.headers['x-github-event']
    , payload = req.body
    , supported = cfg.github.EVENTS;

  if (!event || !supported[event]) {
    return res
      .status(400)
      .send('Event ' + event + ' is not supported');
  }

  if (!!~supported[event].indexOf(payload.action) === false) {
    return res
      .status(400)
      .send('Action ' + payload.action + ' is not supported');
  }

  return next();
};

/**
 * A middleware for comparing signatures.
 * @param {object} req Request object.
 * @param {object} res Response object.
 * @param {function} next Next middleware function.
 *
 * @return {*} Return next middleware or respond with 401.
 */
middleware.token = function(req, res, next) {
  if (cfg.app.DEBUG) return next();

  var secret = cfg.api.SECRET
    , headers = req.headers
    , payload = JSON.stringify(req.body)
    , signatureSent = headers['x-hub-signature']
    , signature = 'sha1=';

  signature += crypto
    .createHmac('sha1', secret)
    .update(payload)
    .digest('hex');

  if (!signatureSent || signature !== signatureSent) {
    return res
      .status(401)
      .send('Unauthorized');
  }

  return next();
};
