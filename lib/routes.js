var ESLintWorker = require('./workers/eslint');

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.status(200).end();
  });

  app.post('/tinker', function(req, res) {
    var worker = new ESLintWorker(req.body);
    worker.run();

    res.send('Tinkering started');
  });
};