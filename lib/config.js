module.exports = function(app) {
  app.set('port', process.env.PORT || 3000);
  app.set('secret_token', process.env.SECRET_TOKEN || 'ad22e95e3f84e5c01507830c60a446e2bf4aa14a');

  app.set('github_token', process.env.GITHUB_TOKEN || 'github-token');
  app.set('github_events', {
    'pull_request': ['opened', 'synchronize']
  });
};