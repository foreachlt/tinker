var Worker = require('./worker');

/**
 * CommentatorWorker class constructor.
 * @param {object} job Job object.
 */
function CommentatorWorker(job) {
  Worker.call(this, job);
}

CommentatorWorker.prototype = Object.create(Worker.prototype);
CommentatorWorker.prototype.constructor = CommentatorWorker;

/**
 * Main worker function.
 * @param {function} done Done function.
 */
CommentatorWorker.prototype.process = function(done) {

};

module.exports = CommentatorWorker;
