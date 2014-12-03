var express = require('express')
  , app = express();

// Config
app.set('port', process.env.PORT || 3000);
app.set('secret', process.env.SECRET || 'tinker');
app.set('github_token', process.env.TOKEN || 'token');

// Routes
app.get('/', function(req, res) {
  res.status(200).end();
});

app.post('/tinker', function(req, res) {
  res.status(200).end();
});

// Start the server
app.listen(app.get('port'));
console.log('Started the server on port', app.get('port'));