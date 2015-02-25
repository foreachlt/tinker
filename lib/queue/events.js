/**
 * Dependencies.
 */
var kue = require('kue')
  , Job = kue.Job;

var queue = require('./queue')
  , workers = require('../workers')
  , logger = require('../utils/logger')
  , cc = require('../constants');

// Process PR jobs
queue.process(cc.jobs.PR, 5, function(job, done) {
  var worker = new workers.PR(job, done);
  worker.process();
});

// Process ESLint jobs
queue.process(cc.jobs.ESLINT, 5, function(job, done) {
  var worker = new workers.ESLint(job, done);
  worker.process();
});

// Process Commentator jobs
queue.process(cc.jobs.COMMENTATOR, 5, function(job, done) {
  var worker = new workers.Commentator(job, done);
  worker.process();
});

// Reports queued job
queue.on(cc.queue.JOB_ENQUEUE, function(id, type) {
  logger.info('%s job #%s got queued', type, id);
});

// Removes completed job
queue.on(cc.queue.JOB_COMPLETE, function(id) {
  Job.get(id, function(err, job) {
    if (err) return;

    job.remove(function(err) {
      if (err) throw err;

      logger.warn('Removed completed %s job #%d', job.type, job.id);
    });
  });
});
