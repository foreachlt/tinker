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
   * ESLint config.
   * @type {object}
   */
  this.config = null;

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

    // Get PR open state
    .then(function() {
      var options = {
        user: this.data.repository.owner.login,
        repo: this.data.repository.name,
        number: this.data.number
      };

      return github.pr.isOpen(options);
    })

    // If not opened, end the job
    .then(function(isOpen) {
      if (!isOpen) return this.end(done);
    })

    // Fetch PR comments
    .then(function() {
      var options = {
        user: this.data.repository.owner.login,
        repo: this.data.repository.name,
        number: this.data.number,
        per_page: 100
      };

      return github.pr.comments(options);
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
      var options = {
        user: this.data.repository.owner.login,
        repo: this.data.repository.name,
        number: this.data.number,
        per_page: 100
      };

      return github.pr.changedFiles(options);
    })

    // Validate changed files
    .then(function(files) {
      return this.validateFiles(files);
    })

    // Done
    .then(function() {
      console.log('End?');
      this.end(done);
    })

    // Catch any errors
    .catch(function(err) {
      logger.error('Error during %s job #%d: %s'
        , jobType, jobId, String(err));

      this.end(done);
    });
};

/**
 * Fetches the config for ESLint.
 * @returns {object} Promise object.
 */
ESLintWorker.prototype.getConfig = function() {
  var options = {
    user: this.data.repository.owner.login,
    repo: this.data.repository.name,
    path: cfg.workers.eslint.configFile
  };

  return github.repo.fileContents(options, true);
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

    var options = {
      user: that.data.repository.owner.login,
      repo: that.data.repository.name,
      path: fileName,
      ref: ref
    };

    github.repo.fileContents(options)
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
 * Processes ESLint messages
 * @param {string} fileName A file name.
 * @param {array} messages An array of ESLint messages.
 */
ESLintWorker.prototype.processMessages = function(fileName, messages) {
  if (!messages.length) return;

  // TODO: tidy this up
  var jobId = this.job.id
    , jobType = this.job.type;

  var that = this
    , groupedMessages = this.groupMessages(messages)
    , comments = [];

  for(line in groupedMessages) {
    var body = groupedMessages[line].join('\n');

    if (!that.commentExists(fileName, parseInt(line, 10))) {
      comments.push({
        body: body,
        position: line
      });
    } else {
      logger.warn('Comment already exists for %s on line %d', fileName, line);
    }
  }

  logger.info('%d comments to create for %s', comments.length, fileName);

  return Promise.each(comments, function(comment) {
    var options = {
      user: that.data.repository.owner.login,
      repo: that.data.repository.name,
      number: that.data.number,
      commit_id: that.data.pull_request.head.sha,
      body: comment.body,
      path: fileName,
      position: comment.position - 1
    };

    logger.info('Creating comment for %s on line %d: %s', fileName
      , comment.position, comment.body);

    return github.pr.createComment(options);
  });
};

/**
 * Groups ESLint messages by line number.
 * @param {array} messages An array of messages.
 * @returns {object} An array of grouped messages.
 */
ESLintWorker.prototype.groupMessages = function(messages) {
  var result = messages.reduce(function(prev, curr) {
    if (!prev[curr.line]) {
      prev[curr.line] = [];
    }

    prev[curr.line].push(curr.message);

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