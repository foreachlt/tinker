/*
 * Dependencies
 */
var support = require('./support')
  , nock = require('nock')
  , ghUtil = tinker.utils.github;

var githubApiUrl = 'https://api.github.com';

// TODO: add test cases for request headers
describe('Utils: github', function() {
  var gh;

  beforeEach(function() {
    gh = ghUtil({
      user: 'user',
      repo: 'repo',
      token: 'token'
    });
  });

  afterEach(function() {
    nock.cleanAll();
  });

  it('should return the utility', function() {
    expect(gh).to.be.an('object');
  });

  describe('user methods', function() {
    var api = nock(githubApiUrl).get('/user?access_token=token');

    describe('get()', function() {
      it('should have a method defined', function() {
        expect(gh.user.get).to.be.a('function');
      });

      describe('if data was returned from API', function() {
        it('should resolve promise if data was returned from API'
            , function(done) {
          api.reply(200, { foo: 'bar' });

          gh.user.get()
            .then(function(res) {
              expect(res.foo).to.equal('bar');
              done();
            });
        });
      });

      describe('if an error occurred', function() {
        it('should reject promise if http error occurred', function(done) {
          api.reply(500);

          gh.user.get()
            .catch(function(err) {
              expect(err).to.equal('Error retrieving user data');
              done();
            });
        });
      });
    });
  });

  describe('repo methods', function() {
    var api = nock(githubApiUrl)
      .get('/repos/user/repo/contents/filePath?access_token=token');

    describe('fileContents()', function() {
      it('should have a method defined', function() {
        expect(gh.repo.fileContents).to.be.a('function');
      });

      describe('if data was returned from API', function() {
        it('should resolve promise', function(done) {
          api.reply(200, {
            content: support.contentEncode('foo bar')
          });

          gh.repo.fileContents({ path: 'filePath' })
            .then(function(res) {
              expect(res).to.equal('foo bar');
              done();
            });
        });

        it('should parse json content', function(done) {
          api.reply(200, {
            content: support.contentEncode('{ "foo": "bar" }')
          });

          gh.repo.fileContents({ path: 'filePath', json: true })
            .then(function(res) {
              expect(res).to.include.keys('foo');
              done();
            });
        });

        it('should parse yaml content', function(done) {
          api.reply(200, {
            content: support
              .contentEncode(support.loadFixture('file.yaml'))
          });

          gh.repo.fileContents({ path: 'filePath', yaml: true })
            .then(function(res) {
              expect(res).to.include.keys('foo');
              done();
            });
        });
      });

      describe('if an error occurred', function() {
        it('should reject promise', function(done) {
          api.reply(500);

          gh.repo.fileContents({ path: 'filePath' })
            .catch(function(err) {
              expect(err)
                .to
                .equal('Error retrieving file contents for filePath');
              done();
            });
        });
      });
    });
  });

  describe('pr methods', function() {
    describe('isMerged', function() {
      var api = nock(githubApiUrl)
        .get('/repos/user/repo/pulls/1?access_token=token');

      it('should have a method defined', function() {
        expect(gh.pr.isMerged).to.be.a('function');
      });

      describe('if data was returned from API', function() {
        it('should resolve promise', function(done) {
          api.reply(200, { merged: true });

          gh.pr.isMerged({ number: 1 })
            .then(function(res) {
              expect(res).to.equal(true);
              done();
            });
        });
      });

      describe('if an error occurred', function() {
        it('should reject promise', function(done) {
          api.reply(500);

          gh.pr.isMerged({ number: 1 })
            .catch(function(err) {
              expect(err).to.equal('Error retrieving merge status for pr 1');
              done();
            });
        });
      });
    });

    describe('diff()', function() {
      var api = nock('http://foo.bar')
        .get('/file.diff');

      it('should have a method defined', function() {
        expect(gh.pr.diff).to.be.a('function');
      });

      describe('if data was returned from API', function() {
        it('should resolve promise', function(done) {
          api.reply(200, 'diff');

          gh.pr.diff('http://foo.bar/file.diff')
            .then(function(res) {
              expect(res).to.equal('diff');
              done();
            });
        });

        describe('if an error occurred', function() {
          it('should reject promise', function(done) {
            api.reply(500);

            gh.pr.diff('http://foo.bar/file.diff')
              .catch(function(err) {
                expect(err).to.equal('Error retrieving diff');
                done();
              });
          });
        });
      });
    });

    describe('changedFiles()', function() {
      var api = nock(githubApiUrl)
        .get('/repos/user/repo/pulls/1/files?access_token=token');

      describe('if data was returned from API', function() {
        it('should resolve promise', function(done) {
          api.reply(200, [ { filename: 'foo.js' } ]);

          gh.pr.changedFiles({ number: 1 })
            .then(function(res) {
              expect(res.length).to.equal(1);
              done();
            });
        });
      });

      describe('if an error occurred', function() {
        it('should reject promise', function(done) {
          api.reply(500);

          gh.pr.changedFiles({ number: 1 })
            .catch(function(res) {
              expect(res).to.equal('Error retrieving changed files');
              done();
            });
        });
      });
    });

    describe('comments()', function() {
      var api = nock(githubApiUrl)
        .get('/repos/user/repo/pulls/1/comments?access_token=token');

      describe('if data was returned from API', function() {
        it('should resolve promise', function(done) {
          api.reply(200, [ { foo: 'bar' } ]);

          gh.pr.comments({ number: 1 })
            .then(function(res) {
              expect(res.length).to.equal(1);
              done();
            });
        });
      });

      describe('if an error occurred', function() {
        it('should reject promise', function(done) {
          api.reply(500);

          gh.pr.comments({ number: 1 })
            .catch(function(err) {
              expect(err).to.equal('Error retrieving comments');
              done();
            });
        });
      });
    });

    // TOOD: fix this test
    describe.skip('createComment', function() {
      var api = nock(githubApiUrl)
        .post('/foo', '*');

      describe('if data was successfully sent to API', function() {
        it('should resolve promise', function(done) {
          api.reply(200, {});

          gh.pr.createComment({
            number: 1,
            commit_id: 2,
            body: 'foo',
            path: 'foo.html',
            position: 0
          })
            .then(function() {
              done();
            });
        });
      });

      describe('if an error occurred', function() {
        it('should reject promise', function(done) {
          done();
        });
      });
    });
  });
});
