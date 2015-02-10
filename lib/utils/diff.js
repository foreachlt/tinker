var parse = require('diff-parse');

/**
 * Diff class constructor.
 * @param {object} data Parsed diff data.
 */
function Diff(data) {
  this.data = data;
}

/**
 * Gets parsed diff for a file.
 * @param {string} fileName File name.
 * @returns {object|null} File diff or null.
 */
Diff.prototype.fileDiff = function(fileName) {
  return this.data.filter(function(file) {
    return file.to === fileName;
  }).pop() || null;
};

/**
 * Gets diff position for a given file name and changed line number.
 * @param {string} fileName Name of the file.
 * @param {int} changedLine Line number.
 * @returns {int|null} Diff position for a given line or null.
 */
Diff.prototype.position = function(fileName, changedLine) {
  var fileDiff = this.fileDiff(fileName)
    , position;

  var lineInDiff = fileDiff.lines.filter(function(line) {
    return line.type === 'add' && line.ln === changedLine;
  }).pop() || null;

  position = fileDiff.lines.indexOf(lineInDiff);

  return position > -1 ? position : null;
};

/**
 * Checks diff to see if content was added at a given line.
 * @param {string} fileName Name of the file.
 * @param {int} line Line number.
 * @returns {boolean} True or false depending if added or not.
 */
Diff.prototype.wasAdded = function(fileName, line) {
  return !!this.position(fileName, line);
};

module.exports = function(diff) {
  return new Diff(parse(diff));
};
