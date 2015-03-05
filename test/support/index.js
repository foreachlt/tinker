/**
 * Depencencies
 */
var fs = require('fs')
  , chai = require('chai')
  , spies = require('chai-spies');

var tinker = require('../../')();

/**
 * Chai configuration
 */
chai.use(spies);

/**
 * Expose certain modules globally
 */
global.expect = chai.expect;
global.tinker = tinker;

/**
 * Support module
 */
var support = module.exports = {};

/**
 * Loads the fixture file from the fixtures dir.
 * @param {string} filename Filename
 *
 * @returns {[type]} Contents of the file.
 */
support.loadFixture = function(filename) {
  return fs.readFileSync(__dirname + '/fixtures/' + filename
    , { encoding: 'utf8' });
};

/**
 * Encodes the content as base64.
 * @param {string} str Content.
 *
 * @returns {string} Encoded content.
 */
support.contentEncode = function(str) {
  return new Buffer(str).toString('base64');
};

/**
 * No operation.
 */
support.noop = function() {};
