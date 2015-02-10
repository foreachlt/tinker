var Worker = require('./worker');

function InformatorWorker(job) {
  Worker.call(this, job);
}

InformatorWorker.prototype = Object.create(Worker.prototype);
InformatorWorker.prototype.constructor = InformatorWorker;

InformatorWorker.prototype.process = function(done) {

};

module.exports = InformatorWorker;
