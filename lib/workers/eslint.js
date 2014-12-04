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

  process: function(job, done) {
    var eslintrc = null;

    // Set data about the pull request
    this.setData(job.data);

    this.isOpen()
      .bind(this)
      .then(function() {
        return {};
      })
      .then(function() {

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

  },

  getFileContents: function(path, parseJson) {
    var that = this;

    return new Promise(function(resolve, reject) {
      github.repos.getContent({
        user: that.repo.user,
        repo: that.repo.name,
        path: path
      }, function(err, res) {
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

  reset: function() {
    this.repo.user = null;
    this.repo.name = null;
    this.pr.action = null;
    this.pr.number = null;
  }
};