var bodyParser = require('body-parser')
  , crypto = require('crypto')
  , cfg = require('./config');

module.exports = function(app) {
  app.use(bodyParser.json());

  // Validates secret token sent by Github with POST
  app.use(function(req, res, next) {
    if (cfg.app.DEBUG || req.method !== 'POST') return next();

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
  });

  // Checks if event and action is supported
  app.use(function(req, res, next) {
    if (req.method !== 'POST') return next();

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
  });
};
