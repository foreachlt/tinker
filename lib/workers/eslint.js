var Promise = require('bluebird')
  , github = require('../github');

module.exports = {
  process: function(job, done) {
    var eslintrc = null;

    this.isOpen(job.data)
      .bind(this)
      .then(function() {
        return this.getRcFile(job.data);
      })
      .then(function() {

      })
      .catch(function(err) {
        console.error(err);
      })
      .finally(done);
  },

  isOpen: function(data) {
    var repo = data.repository;

    return new Promise(function(resolve, reject) {
      github.pullRequests.get({
        user: repo.owner.login,
        repo: repo.name,
        number: data.number
      }, function(err, res) {
        if (!err && !res.merged) return resolve(true);

        return reject(false);
      });
    });
  },

  getRcFile: function(data) {
    var repo = data.repository;

    return new Promise(function(resolve, reject) {
      github.repos.getContent({
        user: repo.owner.login,
        repo: repo.name,
        path: '.eslintrc'
      }, function(err, res) {
        if (!err) {
          var content = new Buffer(res.content, 'base64').toString('utf8');

          return resolve(JSON.parse(content));
        }

        return reject(err);
      });
    });
  }
};