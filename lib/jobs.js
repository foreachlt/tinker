var kue = require('kue')
  , eslint = require('./workers/eslint')
  , jobs = kue.createQueue();

jobs.process('eslint', function(job, done) {
  eslint.process(job, done);
});

module.exports = jobs;