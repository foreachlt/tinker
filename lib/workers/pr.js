var Promise = require('bluebird')
  , Worker = require('./worker')
  , hipchat = require('../utils/hipchat')
  , cc = require('../constants')
  , cfg = require('../config');

/**
 * PRWorker class is used as
 * an initial worker to gather information
 * about the PR and based on that
 * it triggers other workers to perform
 * specific tasks.
 *
 * @param {object} job Job object.
 * @param {function} done Done function.
 */
function PRWorker(job, done) {
  Worker.call(this, job, done);

  /**
   * Project config data.
   * @type {object}
   */
  this.data.projectConfig = null;

  /**
   * PR diff data.
   * @type {object}
   */
  this.data.diff = null;

  /**
   * PR changed files.
   * @type {array}
   */
  this.data.files = null;
}

PRWorker.prototype = Object.create(Worker.prototype);
PRWorker.prototype.constructor = PRWorker;

/**
 * Main worker function.
 */
PRWorker.prototype.process = function() {
  Worker.prototype.process.call(this);

  Promise
    .bind(this)

    // Check if PR is closed
    .then(function() {
      if (this.data.pr.state === 'closed') {
        return this.end();
      }
    })

    // Get config
    .then(function() {
      return this.getProjectConfig();
    })

    // Store config
    .then(function(config) {
      this.data.projectConfig = config;
    })

    // Get PR diff
    .then(function() {
      return this.gh.pr.diff(this.data.pr.pull_request.url);
    })

    // Store PR diff
    .then(function(diff) {
      this.data.diff = diff;
    })

    // Get a list of changed files
    .then(function() {
      return this.gh.pr.changedFiles({
        number: this.data.pr.number,
        per_page: 100
      });
    })

    // Store changed files
    .then(function(files) {
      this.data.files = files;
    })

    // Trigger other jobs
    .then(function() {
      // TODO: create from the project config file
      this.createChildJob(cc.jobs.ESLINT, this.data);
    })

    .catch(function(err) {
      this.handleErrors(err);
    });
};

PRWorker.prototype.end = function() {
  hipchat.postMessage({
    room: 1253542,
    from: 'Tinker APP',
    message: 'Some awesome stuff <strong>Foo</strong>',
    color: 'yellow'
  }, function(data) {
    console.log(data);
    console.log('???')
  });

  Worker.prototype.end.call(this);
};

/**
 * Fetches project's config file.
 * @returns {object} Promise object.
 */
PRWorker.prototype.getProjectConfig = function() {
  return this.gh.repo.fileContents({
    path: cfg.workers.pr.CONFIG_FILE,
    yaml: true
  });
};

module.exports = PRWorker;
