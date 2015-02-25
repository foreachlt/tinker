var fs = require('fs')
  , chai = require('chai');

var loadFixture = function(src) {
  return fs.readFileSync(__dirname + '/fixtures/' + src, {
    encoding: 'utf8'
  });
};

global.expect = chai.expect;
global.loadFixture = loadFixture;
global.tinker = require('../../')();

module.exports = {};
