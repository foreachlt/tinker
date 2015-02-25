/**
 * Dependencies.
 */
var express = require('express')
  , bodyParser = require('body-parser');

var middleware = require('./middleware')
  , routes = require('./routes');

/**
 * Http module.
 */
var http = module.exports = express();

http
  .post('/event',
    bodyParser.json(),
    middleware.token,
    middleware.githubEvent,
    routes.event);
