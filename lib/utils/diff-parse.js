var parse = require('diff-parse')
  , fs = require('fs');

module.exports = {
  parse: function(diff) {
    return parse(diff);
  }
};