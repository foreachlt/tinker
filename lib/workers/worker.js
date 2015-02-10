var logger = require('../utils/logger')
  , cfg = require('../config')
  , github = require('../utils/github');

/**
 * Worker class constructor.
 * @param {object} job Job object.
 */
function Worker(job) {
  /**
   * Job object.
   * @type {object}
   */
  this.job = job;

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
    user: this.data.repository.owner.login,
    repo: this.data.repository.name
  });
}

/**
 * Main worker function.
 * @param {function} Done function.
 */
Worker.prototype.process = function() {
  logger.info('Started %s job #%d', this.job.type, this.job.id);
};

/**
 * Error handler
 * @param {*} err Error/errors to handle or report.
 * @param {function} done Worker's done function.
 */
Worker.prototype.handleErrors = function(err, done) {
  logger.error('Error during %s job #%d: %s'
    , this.job.type, this.job.id, String(err));

  this.end(function() {
    return done(new Error(err));
  });
};

/**
 * Ends worker job.
 * @param {function} done Done function.
 */
Worker.prototype.end = function(done) {
  logger.info('Ended %s job #%d', this.job.type, this.job.id);
  done();
};

module.exports = Worker;
