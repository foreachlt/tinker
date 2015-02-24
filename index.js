// TODO: This is temporary

var express = require('express');

var http = require('./lib/http');

var app = express();

app.use(http);

app.listen(3000);


