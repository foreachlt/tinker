module.exports = function(app) {
  app.get('/', function(req, res) {
    res.status(200).end();
  });

  app.post('/tinker', function(req, res) {
    res.send('Tinkering started');
  });
};