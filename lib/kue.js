var kue = require('kue');

module.exports = function(app) {
  app.use('/', kue.app);
};