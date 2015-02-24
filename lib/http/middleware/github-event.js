var cfg = require('../../config');

/**
 * A middleware for validating Github event.
 * @param {object} req Request object.
 * @param {object} res Response object.
 * @param {function} next Next middleware function.
 *
 * @return {*} Return next middleware or respond with 400.
 */
module.exports = function(req, res, next) {
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
