var Promise = require('bluebird')
  , Github = require('github')
  , cfg = require('../config')
  , client = new Github({
      version: '3.0.0',
      debug: cfg.github.DEBUG
    });

// TODO: need to work out rate limits and if we ran out
client.authenticate({
  type: 'oauth',
  token: cfg.github.TOKEN
});

module.exports = {
  /**
   * Methods related to a repository.
   * @type {object}
   */
  repo: {
    /**
     * Retrieves file contents.
     * @param {object} options User, repo, path, ref (optional).
     * @param {boolean} parseJSON Set to true if JSON parsing is needed.
     * @return {object} A promise object.
     */
    fileContents: function(options, parseJSON) {
      return new Promise(function(resolve, reject) {
        client.repos.getContent(options, function(err, res) {
          if (!err) {
            var content = new Buffer(res.content, 'base64').toString('utf8');

            if (parseJSON) content = JSON.parse(content);

            return resolve(content);
          }

          return reject(err);
        });
      });
    }
  },

  /**
   * Methods / properties related to PRs
   * @type {object}
   */
  pr: {
    /**
     * Checks if the PR is open or not.
     * @param {object} options User, repo, number (pr).
     * @return {object} A promise object.
     */
    isOpen: function(options) {
      return new Promise(function(resolve, reject) {
        client.pullRequests.get(options, function(err, res) {
          if (!err) return resolve(res.merged);

          return reject(err);
        });
      });
    },

    /**
     * Retrieves files changed in the PR.
     * @param {object} options User, repo, number (pr), per_page.
     * @return {object} A promise object.
     */
    changedFiles: function(options) {
      return new Promise(function(resolve, reject) {
        client.pullRequests.getFiles(options, function(err, res) {
          if (!err) {
            var files = res.filter(function(file) {
              return !!~file.filename.indexOf('.js');
            });

            return resolve(files);
          }

          return reject(err);
        });
      });
    },

    /**
     * Retrieves comments for a pr.
     * @param {object} options User, repo, number, per_page.
     * @return {object} A promise object.
     */
    comments: function(options) {
      return new Promise(function(resolve, reject) {
        client.pullRequests.getComments(options, function(err, res) {
          if (!err) return resolve(res);

          return reject(err);
        });
      });
    },

    /**
     * Creates a comment.
     * @param {object} options User, repo, number, commit_id, body, path, position
     * @return {object} A promise object.
     */
    createComment: function(options) {
      return new Promise(function(resolve, reject) {
        client.pullRequests.createComment(options, function(err) {
          if (!err) {
            return resolve();
          }

          return reject(err);
        });
      });
    }
  }
};