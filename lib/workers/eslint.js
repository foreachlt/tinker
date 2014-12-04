var Promise = require('bluebird')
  , github = require('../github');

module.exports = {
  repo: {
    user: null,
    name: null
  },

  pr: {
    action: null,
    number: null
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
      .catch(function(err) {
        console.error(err);
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
  },

  isOpen: function() {
    var that = this;

    return new Promise(function(resolve, reject) {
      github.pullRequests.get({
        user: that.repo.user,
        repo: that.repo.name,
        number: that.pr.number
      }, function(err, res) {
        if (!err && !res.merged) return resolve(true);

        return reject(false);
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

  getFileRef: function(url) {
    var regex = new RegExp(/\?ref=(.+)/g)
      , matches = regex.exec(url);

    return matches[1] || null;
  },

  validateFiles: function(files) {
    var that = this;

    var promise = new Promise(function(resolve, reject) {
      files.forEach(function(file) {
        var name = file.filename
          , ref = that.getFileRef(file.contents_url);

        // If ref not found, skip
        if (!ref) return;

        that.getFileContents(name, false, ref)
          .then(function(contents) {
            return that.eslint(contents);
          })
          .then(function(errors) {
            return resolve(errors);
          })
          .catch(function(err, foo) {
            return reject(err);
          });
      });
    });

    return promise;
  },

  eslint: function(contents) {
    console.log(contents);
  },

  processErrors: function(errors) {

  },

  createComment: function() {

  },

  reset: function() {
    this.repo.user = null;
    this.repo.name = null;
    this.pr.action = null;
    this.pr.number = null;
    this.cfg = null;
  }
};