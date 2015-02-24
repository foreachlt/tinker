var crypto = require('crypto')
  , cfg = require('../../config');

/**
 * A middleware for comparing signatures.
 * @param {object} req Request object.
 * @param {object} res Response object.
 * @param {function} next Next middleware function.
 *
 * @return {*} Return next middleware or respond with 401.
 */
module.exports = function(req, res, next) {
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
