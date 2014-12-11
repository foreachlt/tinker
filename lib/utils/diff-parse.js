var parse = require('diff-parse')
  , fs = require('fs');

var diffContents = fs.readFileSync('33.diff', 'utf8');

console.log(parse(diffContents)[0].lines);