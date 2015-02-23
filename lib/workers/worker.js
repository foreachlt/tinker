var github = require('../utils/github')
  , logger = require('../utils/logger')
  , cc = require('../constants')
  , cfg = require('../config');

/**
 * Worker class constructor.
 * @param {object} job Job object.
 * @param {function} done Done function.
 */
function Worker(job, done) {
  /**
   * Job object.
   * @type {object}
   */
  this.job = job;

  /**
   * Job's done function
   * @type {function}
   */
  this.doneFunc = done;

  /**
   * Job data that was assigned to the job.
   * @type {object}
   */
  this.data = job.data;

  /**
   * Github helper instance.
   * @type {object}
   */
  this.gh = github({
    token: cfg.github.TOKEN,
    user: this.data.pr.repository.owner.login,
    repo: this.data.pr.repository.name
  });

  /**
   * Stores child jobs
   * @type {array}
   */
  this.childJobs = [];
}

/**
 * Main worker function.
 */
Worker.prototype.process = function() {
  logger.info('Started %s job #%d', this.job.type, this.job.id);
};

/**
 * Ends worker job.
 */
Worker.prototype.end = function() {
  logger.info('Ended %s job #%d', this.job.type, this.job.id);
  this.doneFunc();
};

/**
 * Creates a child job for a parent worker.
 * @param {string} type Job name/type.
 * @param {object} data Data object for a job
 */
Worker.prototype.createChildJob = function(type, data) {
  var that = this
    , queue = require('../queue')
    , job = queue.create(type, data);

  job.save(function(err) {
    if (!err) {
      logger.info('Created child job %s #%d for %s #%d', job.type, job.id
        , that.job.type, that.job.id);

      that.childJobs.push(job);

      job.on(cc.job.COMPLETE, function() {
        logger.info('Child job complete %s #%d', job.type, job.id);
        that.childJobComplete(job);
      });
    } else {
      throw new Error('Error creating a child job ' + job.type);
    }
  });
};

/**
 * A handle for a completed worker.
 * @param {object} job Job data.
 */
Worker.prototype.childJobComplete = function(job) {
  this.childJobs.splice(this.childJobs.indexOf(job), 1);
  if (!this.childJobs.length) this.end();
};

/**
 * Error handler
 * @param {*} err Error/errors to handle or report.
 */
Worker.prototype.handleErrors = function(err) {
  var that = this;

  logger.error('Error during %s job #%d: %s'
    , this.job.type, this.job.id, String(err));

  this.end(function() {
    return that.doneFunc(new Error(err));
  });
};

module.exports = Worker;
