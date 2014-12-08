var Promise = require('bluebird')
  , logger = require('winston')
  , github = require('../github')
  , linter = require('eslint').linter;

function ESLintWorker(job) {
  this.job = job;
  this.data = job.data;
}

ESLintWorker.prototype.process = function(done) {
  logger.info('Started ESLint job #%s', this.job.id);
};

ESLintWorker.prototype.validateFiles = function() {

};

ESLintWorker.prototype.validateFile = function() {

};

module.exports = ESLintWorker;