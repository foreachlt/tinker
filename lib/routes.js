var jobs = require('./jobs');

module.exports = function(app) {
  app.post('/tinker', function(req, res) {
    jobs.create('eslint', req.body).save(function(err) {
      if (!err) return res.send('Tinkering started');

      return res.status(500).end();
    });
  });
};