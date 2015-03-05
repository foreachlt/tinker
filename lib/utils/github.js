/**
 * Dependencies.
 */
var Promise = require('bluebird')
  , Github = require('github')
  , extend = require('util')._extend
  , request = require('request')
  , yaml = require('js-yaml');

var cfg = require('../config');

/**
 * Github module.
 * @param {object} options Options for Github client.
 *
 * @return {object} Github utility.
 */
module.exports = function(options) {
  var token = options.token
    , defaults = {
        user: options.user,
        repo: options.repo
      };

  var client = new Github({
    version: '3.0.0',
    debug: cfg.app.DEBUG
  });

  client.authenticate({
    type: 'oauth',
    token: token
  });

  return {
    /**
     * Github client
     * @type {object}
     */
    client: client,

    /**
     * Methods related to user.
     * @type {object}
     */
    user: {
      /**
       * Gets user data.
       * @return {object} A promise object.
       */
      get: function() {
        return new Promise(function(resolve, reject) {
          client.user.get({}, function(err, res) {
            if (!err) return resolve(res);

            return reject('Error retrieving user data');
          });
        });
      }
    },

    /**
     * Methods related to a repository.
     * @type {object}
     */
    repo: {
      /**
       * Retrieves file contents.
       * @param {object} options Path, ref (optional).
       * @return {object} A promise object.
       */
      fileContents: function(options) {
        // TODO: revisit this
        var optionsCopy = extend({}, defaults);
        options = extend(optionsCopy, options);

        return new Promise(function(resolve, reject) {
          client.repos.getContent(options, function(err, res) {
            if (!err) {
              var content = new Buffer(res.content, 'base64').toString('utf8');

              if (options.json) content = JSON.parse(content);
              if (options.yaml) content = yaml.safeLoad(content);

              return resolve(content);
            }

            return reject('Error retrieving file contents for ' + options.path);
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

            return reject('Error retrieving merge status for pr '
              + options.number);
          });
        });
      },

      /**
       * Fetches PR diff.
       * @param {string} url Full URL to PR.
       * @type {object} A promise object.
       *
       * @returns {object} Promise object.
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
            if (!err && res.statusCode === 200) {
              return resolve(res.body);
            }

            return reject('Error retrieving diff');
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
              // TODO: should remove this, and handle it within the worker
              var files = res.filter(function(file) {
                return !!~file.filename.indexOf('.js');
              });

              return resolve(files);
            }

            return reject('Error retrieving changed files');
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

            return reject('Error retrieving comments');
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

            return reject('Error whilst creating a comment');
          });
        });
      }
    }
  };
};
