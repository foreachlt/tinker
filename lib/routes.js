var queue = require('./queue');

module.exports = function(app) {
  app.post('/payload', function(req, res) {
    queue.create('pr', req.body).save(function(err) {
      if (!err) return res.send('Started tinkering.');

      return res.status(500).end();
    });
  });
};
