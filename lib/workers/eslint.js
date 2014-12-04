var Promise = require('bluebird')
  , github = require('../github')
  , linter = require('eslint').linter;

module.exports = {
  repo: {
    user: null,
    name: null
  },

  pr: {
    action: null,
    number: null,
    sha: null
  },

  cfg: null,

  process: function(job, done) {
    // Set data about the pull request
    this.setData(job.data);

    // Check if PR is still open
    this.isOpen()
      .bind(this)
      .then(function() {
        // Get .eslintrc
        return this.getFileContents('.eslintrc', true);
      })
      .then(function(eslintCfg) {
        // Store config
        this.cfg = eslintCfg;

        // Get changed files
        return this.getChangedFiles();
      })
      .then(function(changedFiles) {
        return this.validateFiles(changedFiles);
      })
      .then(function() {
        console.log('all done!');
      })
      .catch(function(err) {
        console.error('error', err);
      })
      .finally(function() {
        this.reset();
        done();
      });
  },

  setData: function(data) {
    this.repo.user = data.repository.owner.login;
    this.repo.name = data.repository.name;
    this.pr.action = data.action;
    this.pr.number = data.number;
    this.pr.sha = data.pull_request.head.sha;
  },

  isOpen: function() {
    var that = this;

    return new Promise(function(resolve, reject) {
      github.pullRequests.get({
        user: that.repo.user,
        repo: that.repo.name,
        number: that.pr.number
      }, function(err, res) {
        if (!err && !res.merged) return resolve();

        return reject(err);
      });
    });
  },

  getChangedFiles: function() {
    var that = this
    // TODO: handle pagination
    return new Promise(function(resolve, reject) {
      github.pullRequests.getFiles({
        user: that.repo.user,
        repo: that.repo.name,
        number: that.pr.number,
        per_page: 100
      }, function(err, res) {
        if (!err) return resolve(res);

        return reject(err);
      });
    });
  },

  getFileContents: function(path, parseJson, ref) {
    var that = this
      , params = {
          user: this.repo.user,
          repo: this.repo.name,
          path: path
        };

    // Set ref if specified
    if (ref) params.ref = ref;

    return new Promise(function(resolve, reject) {
      github.repos.getContent(params, function(err, res) {
        if (!err) {
          var content = new Buffer(res.content, 'base64').toString('utf8');

          if (parseJson) {
            content = JSON.parse(content);
          }

          return resolve(content);
        }

        return reject(err);
      });
    });
  },

  validateFiles: function(files) {
    var that = this
      , validations = [];

    files.forEach(function(file, index) {
      validations.push(that.validateFile(file));
    });

    return Promise.all(validations);
  },

  validateFile: function(file) {
    var that = this
      , filename = file.filename
      , ref = that.pr.sha;

    return new Promise(function(resolve, reject) {
      // Reject if no file ref
      if (!ref) return reject('File ref not found');

      that.getFileContents(filename, false, ref)
        .then(function(contents) {
          console.log('Validating file', filename);
          return that.eslint(contents);
        })
        .then(function(messages) {
          console.log('Processing messages for', filename, messages);
          return that.processMessages(filename, messages);
        })
        .then(resolve)
        .catch(reject);
    });
  },

  eslint: function(contents) {
    var that = this;

    return new Promise(function(resolve, reject) {
      var messages = linter.verify(contents, that.cfg);

      return resolve(messages);
    });
  },

  processMessages: function(filename, messages) {
    var that = this
      , comments = [];

    messages.forEach(function(msg) {
      comments.push(that.createComment(msg.message, filename, msg.line));
    });

    return Promise.all(comments);
  },

  createComment: function(body, path, position) {
    var that = this;

    return new Promise(function(resolve, reject) {
      github.pullRequests.createComment({
        user: that.repo.user,
        repo: that.repo.name,
        number: that.pr.number,
        commit_id: that.pr.sha,
        body: body,
        path: path,
        position: position
      }, function(err) {
        if (!err) {
          console.log('Created comment', body, path, position);
          return resolve();
        }

        return reject();
      });

      resolve();
    });
  },

  reset: function() {
    this.repo.user = null;
    this.repo.name = null;
    this.pr.action = null;
    this.pr.number = null;
    this.pr.sha = null;
    this.cfg = null;
  }
};