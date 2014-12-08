var kue = require('kue')
  , cfg = require('./config')
  , Job = kue.Job
  , jobs = kue.createQueue({
      redis: {
        port: cfg.redis.PORT || 6379,
        host: cfg.redis.HOST || '127.0.0.1',
        auth: cfg.redis.AUTH || null
      }
    });

var workers = {
  eslint: require('./workers/eslint')
};

// Process eslint jobs
jobs.process('eslint', function(job, done) {
  workers.eslint.process(job, done);
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