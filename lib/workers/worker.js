var logger = require('../utils/logger');

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
}

/**
 * Main worker function.
 * @param {function} Done function.
 */
Worker.prototype.process = function(done) {
  logger.info('Started %s job #%d', this.job.type, this.job.id);
};

/**
 * Ends worker job.
 * @param {function} Done function.
 */
Worker.prototype.end = function(done) {
  logger.info('Ended %s job #%d', this.job.type, this.job.id);
  done();
};

module.exports = Worker;