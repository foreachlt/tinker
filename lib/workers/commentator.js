var Worker = require('./worker');

function CommentatorWorker(job) {
  Worker.call(this, job);
}

CommentatorWorker.prototype = Object.create(Worker.prototype);
CommentatorWorker.prototype.constructor = CommentatorWorker;

CommentatorWorker.prototype.process = function(done) {

};

module.exports = CommentatorWorker;
