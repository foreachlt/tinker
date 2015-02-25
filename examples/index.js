var express = require('express')
  , kue = require('kue');

var tinker = require('../')();

var app = express();

app.use('/', kue.app);
app.use('/api', tinker.http);

app.listen(3000);
