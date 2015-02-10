var kue = require('kue')
  , cfg = require('./config')
  , logger = require('./utils/logger')
  , Job = kue.Job
  , queue = kue.createQueue({
      redis: {
        port: cfg.redis.PORT,
        host: cfg.redis.HOST,
        auth: cfg.redis.AUTH
      }
    });

// An object holding all workers
var workers = {
  PR: require('./workers/pr')
};

// Process PR jobs
queue.process('pr', function(job, done) {
  var worker = new workers.PR(job);
  worker.process(done);
});

// Process eslint jobs
queue.process('eslint', function(job, done) {
  done();
  // var worker = new registry.getById('eslint').ESLint(job);

  // worker.process(done);
});

// Reports queued job
queue.on('job enqueue', function(id) {
  logger.info('Job #%s got queued', id);
});

// Removes completed job
queue.on('job complete', function(id) {
  Job.get(id, function(err, job) {
    if (err) return;

    job.remove(function (err) {
      if (err) throw err;

      logger.info('Removed completed job #%d', job.id);
    });
  });
});

module.exports = queue;
