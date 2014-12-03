var express = require('express')
  , app = express();

// Config
app.set('port', process.env.PORT || 3000);

// Routes
app.get('/payload', function(req, res) {
  res.status(200).end();
});

app.get('/ping', function(req, res) {
  res.status(200).end();
});

// Start the server
app.listen(app.get('port'));
console.log('Started the server on port', app.get('port'));