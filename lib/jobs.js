var kue = require('kue')
  , eslint = require('./workers/eslint')
  , jobs = kue.createQueue({
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || '127.0.0.1',
        auth: process.env.REDIS_PASSWORD || null
      }
    });

jobs.process('eslint', function(job, done) {
  eslint.process(job, done);
});

module.exports = jobs;