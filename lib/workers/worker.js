var Parallel = require('paralleljs');

function Worker(data) {
  this.data = data;
  this.p = new Parallel(data);
};

Worker.prototype.run = function() {

};

module.exports = Worker;