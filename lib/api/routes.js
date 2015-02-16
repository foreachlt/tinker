var queue = require('../queue')
  , kue = require('kue')
  , cc = require('../constants');

module.exports = function(app) {
  app.use('/', kue.app);

  app.post('/payload', function(req, res) {
    queue.create(cc.workers.PR, req.body).save(function(err) {
      if (!err) return res.status(201).end();

      return res.status(500).end();
    });
  });
};
