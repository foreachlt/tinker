var Github = require('github')
  , client = new Github({
      version: '3.0.0',
      debug: true
    });

  client.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN // TODO: rework config
  });

module.exports = client;