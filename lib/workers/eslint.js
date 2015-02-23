var Promise = require('bluebird')
  , Worker = require('./worker')
  , linter = require('eslint').linter
  , diff = require('../utils/diff')
  , logger = require('../utils/logger')
  , cfg = require('../config')
  , cc = require('../constants');

/**
 * ESLintWorker class constructor.
 * @param {object} job Job object.
 * @param {function} done Done function.
 */
function ESLintWorker(job, done) {
  Worker.call(this, job, done);

  /**
   * ESLint config.
   * @type {object}
   */
  this.config = null;

  /**
   * Comments to be inserted.
   * @type {array}
   */
  this.data.comments = [];
}

ESLintWorker.prototype = Object.create(Worker.prototype);
ESLintWorker.prototype.constructor = ESLintWorker;

/**
 * Main worker function.
 */
ESLintWorker.prototype.process = function() {
  Worker.prototype.process.call(this);

  Promise
    .bind(this)

    // Fetch .eslintrc file
    .then(function() {
      return this.getConfig();
    })

    // Store .eslintrc
    .then(function(config) {
      this.config = config;
    })

    // Validate changed files
    .then(function() {
      return this.validateFiles(this.data.files);
    })

    // Create child jobs
    .then(function() {
      this.createChildJob(cc.jobs.COMMENTATOR, this.data);
    })

    // Catch any errors
    .catch(function(err) {
      this.handleErrors(err);
    });
};

/**
 * Fetches the config for ESLint.
 * @returns {object} Promise object.
 */
ESLintWorker.prototype.getConfig = function() {
  return this.gh.repo.fileContents({
    path: cfg.workers.eslint.CONFIG_FILE,
    json: true
  });
};

/**
 * Validates given files.
 * @param {array} files An array of files to validate.
 * @returns {object} Promise object.
 */
ESLintWorker.prototype.validateFiles = function(files) {
  var that = this;

  return Promise.each(files, function(file) {
    return that.validateFile(file);
  });
};

/**
 * Validates a given file.
 * @param {object} file File object.
 * @returns {object} Promise object.
 */
ESLintWorker.prototype.validateFile = function(file) {
  var that = this
    , fileName = file.filename
    , ref = this.data.pr.pull_request.head.sha;

  return new Promise(function(resolve, reject) {
    if (!ref) return reject('File ref not given for file: ' + file);

    that.gh.repo.fileContents({
      path: fileName,
      ref: ref
    })
      // Pass through ESLint
      .then(function(contents) {
        logger.info('ESLint validation on %s', fileName);
        return that.esLint(contents);
      })

      // Process ESLint messages
      .then(function(messages) {
        return that.processMessages(fileName, messages);
      })

      // Sort messages into comments
      .then(function(messages) {
        that.data.comments =
          that.data.comments.concat(that.createComments(fileName, messages));
      })

      // File validation done
      .then(resolve)

      // Catch any errors and reject
      .catch(function(e) {
        reject('Error occurred whilst validating file: ' + fileName + ': ' + e);
      });
  });
};

/**
 * ESLint validation for Javascript file contents.
 * @param {string} contents File contents.
 * @returns {object} A promise object.
 */
ESLintWorker.prototype.esLint = function(contents) {
  var that = this;

  return new Promise(function(resolve, reject) {
    try {
      resolve(linter.verify(contents, that.config));
    } catch(e) {
      reject(e);
    }
  });
};

/* Processes ESLint messages.
 * @param {string} fileName A file name.
 * @param {array} messages An array of ESLint messages.
 *
 * @returns {array} An array of processed messages.
 */
ESLintWorker.prototype.processMessages = function(fileName, messages) {
  return this.filterMessages(fileName, messages);
};

/**
 * Filters ESLint messages based on the PR diff.
 * @param {string} fileName File name.
 * @param {array} messages An array of messages.
 * @returns {array} A filtered ESLint messages array.
 */
ESLintWorker.prototype.filterMessages = function(fileName, messages) {
  var prDiff = diff(this.data.diff);
  var filtered = messages.filter(function(message) {
    message.pos = prDiff.position(fileName, message.line);

    return !!message.pos;
  }, this);

  return this.groupMessages(filtered);
};

/**
 * Groups ESLint messages by diff position.
 * @param {array} messages An array of messages.
 * @returns {object} An array of grouped messages.
 */
ESLintWorker.prototype.groupMessages = function(messages) {
  var result = messages.reduce(function(prev, curr) {
    if (!prev[curr.pos]) prev[curr.pos] = [];

    prev[curr.pos].push(curr.message);

    return prev;
  }, {});

  return result;
};

/**
 * Takes ESLint messages and sorts them out into Github friendly comments.
 * @param {string} fileName Filename.
 * @param {object} messages An object of filtered ESLint messages.
 * @return {array} Comments.
 */
ESLintWorker.prototype.createComments = function(fileName, messages) {
  var comments = [];

  if (!Object.keys(messages).length) return comments;

  Object.keys(messages).forEach(function(pos) {
    var body = messages[pos].join('\n');

    pos = parseInt(pos, 10);

    comments.push({
      fileName: fileName,
      position: pos,
      body: body
    });
  });

  return comments;
};

module.exports = ESLintWorker;
