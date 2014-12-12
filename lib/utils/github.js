var Promise = require('bluebird')
  , Github = require('github')
  , extend = require('util')._extend
  , request = require('request')
  , cfg = require('../config')
  , diffParse = require('./diff-parse');

module.exports = function(options) {
  var token = options.token
    , defaults = {
        user: options.user,
        repo: options.repo
      };

  var client = new Github({
    version: '3.0.0',
    debug: cfg.github.DEBUG
  });

  client.authenticate({
    type: 'oauth',
    token: token
  });

  return {
    /**
     * Methods related to a repository.
     * @type {object}
     */
    repo: {
      /**
       * Retrieves file contents.
       * @param {object} options Path, ref (optional).
       * @param {boolean} parseJSON Set to true if JSON parsing is needed.
       * @return {object} A promise object.
       */
      fileContents: function(options, parseJSON) {
        options = extend(defaults, options);

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
       * Checks if the PR is merged or not.
       * @param {object} options Number (pr).
       * @return {object} A promise object.
       */
      isMerged: function(options) {
        options = extend(defaults, options);

        return new Promise(function(resolve, reject) {
          client.pullRequests.get(options, function(err, res) {
            if (!err) return resolve(res.merged);

            return reject(err);
          });
        });
      },

      /**
       * Fetches PR diff.
       * @param {string} url Full URL to PR.
       * @type {object} A promise object.
       */
      diff: function(url) {
        return new Promise(function(resolve, reject) {
          request.get({
            url: url,
            headers: {
              'Authorization': 'token ' + token,
              'User-Agent': 'NodeJS HTTP Client',
              'Accept': 'application/vnd.github.v3.diff'
            }
          }, function(err, res) {
            if (!err) return resolve(res.body);

            return reject(err);
          });
        });
      },

      /**
       * Retrieves files changed in the PR.
       * @param {object} options Number (pr), per_page.
       * @return {object} A promise object.
       */
      changedFiles: function(options) {
        options = extend(defaults, options);

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
       * @param {object} options Number, per_page.
       * @return {object} A promise object.
       */
      comments: function(options) {
        options = extend(defaults, options);

        return new Promise(function(resolve, reject) {
          client.pullRequests.getComments(options, function(err, res) {
            if (!err) return resolve(res);

            return reject(err);
          });
        });
      },

      /**
       * Creates a comment.
       * @param {object} options Number, commit_id, body, path, position
       * @return {object} A promise object.
       */
      createComment: function(options) {
        options = extend(defaults, options);

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
};