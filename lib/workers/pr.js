var Promise = require('bluebird')
  , Worker = require('./worker')
  , cfg = require('../config')
  , logger = require('../utils/logger');

/**
 * PRWorker class is used as
 * an initial worker to gather information
 * about the PR and based on that
 * it triggers other workers to perform
 * specific tasks.
 *
 * @param {object} job Job object.
 */
function PRWorker(job) {
  Worker.call(this, job);

  /**
   * Gathered data.
   * @type {object}
   */
  this.info = {
    original: this.data,
    config: null,
    diff: null,
    files: null
  };
}

PRWorker.prototype = Object.create(Worker.prototype);
PRWorker.prototype.constructor = PRWorker;

/**
 * Main worker function.
 * @param {function} done Done function.
 */
PRWorker.prototype.process = function(done) {
  Promise
    .bind(this)

    // Check if PR is closed
    .then(function() {
      if (this.data.state === 'closed') {
        return this.end(done);
      }
    })

    // Get config
    .then(function() {
      return this.getConfig();
    })

    // Store config
    .then(function(config) {
      return;
    })

    // Get PR diff
    .then(function() {
      return this.gh.pr.diff(this.data.pull_request.url);
    })

    // Store PR diff
    .then(function(diff) {
      this.info.diff = diff;
    })

    // Get a list of changed files
    .then(function() {
      return this.gh.pr.changedFiles({
        number: this.data.number,
        per_page: 100
      });
    })

    // Store changed files
    .then(function(files) {
      this.info.files = files;
    })

    // Trigger other workers
    .then(function() {

    })

    .catch(function(err) {
      this.handleErrors(err, done);
    });
};

/**
 * Fetches project's config file.
 * @returns {object} Promise object.
 */
PRWorker.prototype.getConfig = function() {
  return this.gh.repo.fileContents({
    path: cfg.workers.pr.CONFIG_FILE
  }, true);
};

module.exports = PRWorker;
