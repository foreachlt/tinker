var Promise = require('bluebird')
  , linter = require('eslint').linter
  , cfg = require('../config')
  , logger = require('../utils/logger')
  , Worker = require('./worker')
  , github = require('../utils/github');

/**
 * ESLintWorker class constructor.
 * @param {object} job Job object.
 */
function ESLintWorker(job) {
  Worker.call(this, job);

  /**
   * Github helper instance.
   * @type {object}
   */
  this.gh = github({
    token: cfg.github.TOKEN,
    user: job.data.repository.owner.login,
    repo: job.data.repository.name
  });

  /**
   * ESLint config.
   * @type {object}
   */
  this.config = null;

  /**
   * Parsed Diff.
   * @type {object}
   */
  this.diff = null;

  /**
   * PR comments.
   * @type {array}
   */
  this.comments = [];
}

ESLintWorker.prototype = Object.create(Worker.prototype);
ESLintWorker.prototype.constructor = ESLintWorker;

/**
 * Main worker function.
 * @param {function} Done function.
 */
ESLintWorker.prototype.process = function(done) {
  var jobId = this.job.id
    , jobType = this.job.type;

  Worker.prototype.process.call(this, done);

  Promise
    .bind(this)

    // Get PR merge state
    .then(function() {
      return this.gh.pr.isMerged({
        number: this.data.number
      });
    })

    // If merged, end the job
    .then(function(isMerged) {
      if (!isMerged) return this.end(done);
    })

    // Get PR diff
    .then(function() {
      return this.gh.pr.diff(this.data.pull_request.url);
    })

    // Store diff
    .then(function(diff) {
      this.diff = diff;
    })

    // Fetch PR comments
    .then(function() {
      return this.gh.pr.comments({
        number: this.data.number,
        per_page: 100
      });
    })

    // Store PR comments
    .then(function(comments) {
      this.comments = comments;
    })

    // Fetch .eslintrc file
    .then(function() {
      return this.getConfig();
    })

    // Store .eslintrc
    .then(function(config) {
      this.config = config;
    })

    // Get a list of changed files
    .then(function() {
      return this.gh.pr.changedFiles({
        number: this.data.number,
        per_page: 100
      });
    })

    // Validate changed files
    .then(function(files) {
      return this.validateFiles(files);
    })

    // Done
    .then(function() {
      this.end(done);
    })

    // Catch any errors
    .catch(function(err) {
      logger.error('Error during %s job #%d: %s'
        , jobType, jobId, String(err));

      this.end(function() {
        return done(new Error(err));
      });
    });
};

/**
 * Fetches the config for ESLint.
 * @returns {object} Promise object.
 */
ESLintWorker.prototype.getConfig = function() {
  return this.gh.repo.fileContents({
    path: cfg.workers.eslint.configFile
  }, true);
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
    , ref = this.data.pull_request.head.sha;

  return new Promise(function(resolve, reject) {
    if (!ref) return reject('File ref not supplied');

    that.gh.repo.fileContents({
      path: fileName,
      ref: ref
    })
      // Pass through ESLint
      .then(function(contents) {
        return that.esLint(contents);
      })

      // Process ESLint messages
      .then(function(messages) {
        return that.processMessages(fileName, messages);
      })

      // File validation done
      .then(resolve)

      // Catch any errors and reject
      .catch(function() {
        reject('Error occurred whilst validating file: ' + fileName);
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

/**
 * // TODO: tidy this method up
 * Processes ESLint messages.
 * @param {string} fileName A file name.
 * @param {array} messages An array of ESLint messages.
 */
ESLintWorker.prototype.processMessages = function(fileName, messages) {
  if (!messages.length) return;

  var that = this;

  var jobId = this.job.id
    , jobType = this.job.type;

  var filteredMessages = this.filterMessages(fileName, messages)
    , comments = [];

  for(pos in filteredMessages) {
    var body = filteredMessages[pos].join('\n');

    if (!that.commentExists(fileName, parseInt(pos, 10))) {
      comments.push({
        body: body,
        position: pos
      });
    } else {
      logger.warn('Comment already exists for %s at pos %d', fileName, pos);
    }
  }

  logger.info('%d comments to create for %s', comments.length, fileName);

  return Promise.each(comments, function(comment) {
    logger.info('Creating comment for %s at pos %d: %s', fileName
      , comment.position, comment.body);

    return that.gh.pr.createComment({
      number: that.data.number,
      commit_id: that.data.pull_request.head.sha,
      body: comment.body,
      path: fileName,
      position: comment.position
    });
  });
};

/**
 * Filters ESLint messages based on the PR diff.
 * @param {string} fileName File name.
 * @param {array} messages An array of messages.
 * @returns {array} A filtered ESLint messages array.
 */
ESLintWorker.prototype.filterMessages = function(fileName, messages) {
  var filtered = messages.filter(function(message) {
    message.pos = this.diff.position(fileName, message.line);

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
    if (!prev[curr.pos]) {
      prev[curr.pos] = [];
    }

    prev[curr.pos].push(curr.message);

    return prev;
  }, {});

  return result;
};

/**
 * Checks if a comment exists for a given position.
 * @param {int} fileName Filename.
 * @param {int} position Line number.
 * @returns {boolean} True if exists, otherwise false.
 */
ESLintWorker.prototype.commentExists = function(fileName, line) {
  var that = this;

  return !!(this.comments.filter(function(comment) {
    return comment.path === fileName
        && comment.position === line
        && comment.user.login === 'foreachlt'; // TODO: fix this!
  }).pop() || null);
};

module.exports = ESLintWorker;