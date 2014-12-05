var Promise = require('bluebird')
  , github = require('../github')
  , linter = require('eslint').linter;

// TODO: make a class out of this
module.exports = {
  // TODO: sort out config, env stuf
  username: process.env.GITHUB_USERNAME || 'foreachlt',

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

  comments: null,

  process: function(job, done) {
    // Set data about the pull request
    this.setData(job.data);

    // Job started
    console.log('Job', job.id, 'started for PR', this.pr.number);

    // Check if PR is still open
    this.isOpen()
      .bind(this)
      .then(function() {
        return this.getComments();
      })
      .then(function(comments) {
        this.comments = comments;
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
        console.log('All done!');
        this.reset();
        return done();
      });
      .catch(function(err) {
        console.error('An error occured', err);
        return done(new Error(err));
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
    // TODO: handle pagination
    // TODO: filter JS only
    var that = this

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
          console.log('Processing', messages.length, 'messages for', filename);
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
    if (!messages.length) return;

    var that = this
      , groupedMessages = this.groupMessages(messages)
      , comments = [];

    for(line in groupedMessages) {
      var body = groupedMessages[line].join('\n');

      if (!that.commentExistsAtPos(parseInt(line, 10))) {
        comments.push(that.createComment(body, filename, line));
      }
    }

    console.log('Comments to create:', comments.length);

    // Return a promise of a reverse order of comment promises
    // This is to get the comment sequence right
    return Promise.all(comments);
  },

  groupMessages: function(messages) {
    var result = messages.reverse().reduce(function(prev, curr) {
      if (!prev[curr.line]) {
        prev[curr.line] = [];
      }

      prev[curr.line].push(curr.message);

      return prev;
    }, {});

    return result;
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
          console.log(
            'Created a comment for path:',
            path,
            'on line:',
            position,
            'body:',
            body.replace(/\n/g, ''));

          return resolve();
        }

        return reject(err);
      });
    });
  },

  getComments: function() {
    // TODO: handle pagination
    var that = this;

    return new Promise(function(resolve, reject) {
      github.pullRequests.getComments({
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

  commentExistsAtPos: function(position) {
    var that = this;

    return !!this.comments.filter(function(comment) {
      return comment.position === position
          && comment.user.login === that.username;
    }).pop() || null;
  },

  reset: function() {
    this.repo.user = null;
    this.repo.name = null;
    this.pr.action = null;
    this.pr.number = null;
    this.pr.sha = null;
    this.cfg = null;
    this.comments = null;
  }
};