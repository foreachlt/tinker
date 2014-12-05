var kue = require('kue')
  , Job = kue.Job
  , jobs = kue.createQueue({
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || '127.0.0.1',
        auth: process.env.REDIS_PASSWORD || null
      }
    })
  , eslint = require('./workers/eslint')

// TODO: Job may need to retry?
jobs.process('eslint', function(job, done) {
  eslint.process(job, done);
});

// Removes completed jobs
jobs.on('job complete', function(id) {
  Job.get(id, function(err, job) {
    if (err) return;

    job.remove(function (err) {
      if (err) throw err;
      console.log('Removed completed job #%d', job.id);
    });
  });
});

module.exports = jobs;