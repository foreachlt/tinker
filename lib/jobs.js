var kue = require('kue')
  , cfg = require('./config')
  , logger = require('./utils/logger')
  , Job = kue.Job
  , jobs = kue.createQueue({
      redis: {
        port: cfg.redis.PORT || 6379,
        host: cfg.redis.HOST || '127.0.0.1',
        auth: cfg.redis.AUTH || null
      }
    });

var workers = {
  ESLint: require('./workers/eslint')
};

// Process eslint jobs
jobs.process('eslint', function(job, done) {
  var worker = new workers.ESLint(job);

  worker.process(done);
});

// Reports queued jobs
jobs.on('job enqueue', function(id,type) {
  logger.info('Job #%s got queued', id);
});

// Removes completed jobs
jobs.on('job complete', function(id) {
  Job.get(id, function(err, job) {
    if (err) return;

    job.remove(function (err) {
      if (err) throw err;

      logger.info('Removed completed job #%d', job.id);
    });
  });
});

module.exports = jobs;