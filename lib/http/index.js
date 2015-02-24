var express = require('express')
  , bodyParser = require('body-parser')
  , kue = require('kue');

var logger = require('../utils/logger')
  , cfg = require('../config')
  , token = require('./middleware/token')
  , githubEvent = require('./middleware/github-event')
  , api = require('./routes/api');

var app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/', kue.app);
app.post('/payload', token, githubEvent, api.payload);

module.exports = app;
