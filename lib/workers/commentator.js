/**
 * Dependencies.
 */
var Promise = require('bluebird');

var Worker = require('./worker')
  , utils = require('../utils')
  , logger = utils.logger;

/**
 * CommentatorWorker module.
 */
module.exports = CommentatorWorker;

/**
 * CommentatorWorker class constructor.
 * @param {object} job Job object.
 * @param {function} done Done function.
 */
function CommentatorWorker(job, done) {
  Worker.call(this, job, done);
}

CommentatorWorker.prototype = Object.create(Worker.prototype);
CommentatorWorker.prototype.constructor = CommentatorWorker;

/**
 * Main worker function.
 * @param {function} done Done function.
 */
CommentatorWorker.prototype.process = function() {
  Worker.prototype.process.call(this);

  Promise
    .bind(this)

    // Get user data
    .then(function() {
      return this.gh.user.get();
    })

    // Store user data
    .then(function(user) {
      this.data.user = user;
    })

    // Get existing comments
    .then(function() {
      return this.gh.pr.comments({
        number: this.data.pr.number,
        per_page: 100
      });
    })

    // Store existing comments
    .then(function(existingComments) {
      this.data.existingComments = existingComments;
    })

    // Create comments
    .then(function() {
      return this.createComments();
    })

    // End the job
    .then(function() {
      this.end();
    })

    // Catch any errors
    .catch(function(err) {
      this.handleErrors(err);
    });
};

CommentatorWorker.prototype.createComments = function() {
  var that = this;

  var comments = this.filterComments(this.data.comments);

  logger.info('%d comments to create for %s job #%d', comments.length
    , this.job.type, this.job.id);

  return Promise.each(comments, function(comment) {
    return that.gh.pr.createComment({
      number: that.data.pr.number,
      commit_id: that.data.pr.pull_request.head.sha,
      body: comment.body,
      path: comment.fileName,
      position: comment.position
    });
  });
};

/**
 * Filters comments based on their existance to avoid duplicates.
 * @param {array} comments An array of comments.
 * @return {array} An array of filtered comments.
 */
CommentatorWorker.prototype.filterComments = function(comments) {
  return comments.filter(function(comment) {
    return !this.commentExists(comment);
  }, this);
};

/**
 * Checks if comment exists already.
 * @param {int} comment Comment object.

 * @returns {boolean} True if exists, otherwise false.
 */
CommentatorWorker.prototype.commentExists = function(comment) {
  return !!(this.data.existingComments.filter(function(existing) {
    return existing.path === comment.fileName
        && existing.position === comment.position
        && existing.user.login === this.data.user.login;
  }, this).pop() || null);
};
