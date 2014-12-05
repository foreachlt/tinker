var Github = require('github')
  , client = new Github({
      version: '3.0.0',
      debug: false
    });

  // TODO: need to work out rate limits and if we ran out
  client.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN // TODO: rework config
  });

module.exports = client;