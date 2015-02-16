var kue = require('kue')
  , Job = kue.Job
  , queue = require('./queue')
  , workers = require('./workers')
  , logger = require('./utils/logger')
  , cc = require('../constants');

// Process PR jobs
queue.process(cc.workers.PR, function(job, done) {
  var worker = new workers.PR(job);
  worker.process(done);
});

// Process ESLint jobs
queue.process(cc.workers.ESLint, function(job, done) {
  done();
});

// Process Commentator jobs
queue.process(cc.workers.COMMENTATOR, function(job, done) {
  done();
});

// Reports queued job
queue.on(cc.jobs.ENQUEUE, function(id) {
  logger.info('Job #%s got queued', id);
});

// Removes completed job
queue.on(cc.jobs.COMPLETE, function(id) {
  Job.get(id, function(err, job) {
    if (err) return;

    job.remove(function (err) {
      if (err) throw err;

      logger.info('Removed completed job #%d', job.id);
    });
  });
});
