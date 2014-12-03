var Worker = require('./worker');

function ESLintWorker(data) {
  Worker.call(this, data);

  this.config = null;
};

ESLintWorker.prototype = Object.create(Worker.prototype);
ESLintWorker.prototype.constructor = ESLintWorker;

ESLintWorker.prototype.run = function() {
  var that = this;

  this.p.spawn(function(data) {
    // Get .eslintrc file
  })
  .then(function(data) {
    // Get a list of files that changed
  })
  .then(function(data) {
    // For each file, get contents
  })
  .then(function(data) {
    // Validate with ESLint
  })
  .then(function() {
    // Process invalid results and comment on the PR
  })
  .then(function() {
    // We are done
  });
};

ESLintWorker.prototype.getConfig = function() {

};

ESLintWorker.prototype.getFilesChanged = function() {

};

ESLintWorker.prototype.getFileContents = function(files) {

};

ESLintWorker.prototype.validateChanges = function(fileContents) {

};

ESLintWorker.prototype.processResults = function(results) {

};

module.exports = ESLintWorker;

