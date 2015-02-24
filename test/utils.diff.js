var Diff = require('../lib/utils/diff');

describe('Diff class', function() {
  var diff;

  beforeEach(function() {
    diff = new Diff(loadFixture('example.diff'));
  });

  it('should have no data if invalid diff is passed', function() {
    expect((new Diff('')).data.length).to.equal(0);
  });

  it('should return a valid diff object', function() {
    expect(diff.data.length).to.equal(1);
    expect(diff.data[0].additions).to.equal(3);
    expect(diff.data[0].deletions).to.equal(0);
  });

  describe('methods', function() {
    describe('fileDiff()', function() {
      it('should return a valid diff object for a file', function() {
        var result = diff.fileDiff('helloworld.js');
        expect(result.lines.length).to.equal(5);
        expect(result.additions).to.equal(3);
        expect(result.deletions).to.equal(0);
      });

      it('should return null if filename was not found in diff', function() {
        expect(diff.fileDiff('foo.bar')).to.equal(null);
      });
    });

    describe('position()', function() {
      it('should return a diff position', function() {
        expect(diff.position('helloworld.js', 1)).to.equal(1);
      });

      it('should return null if diff position was not found', function() {
        expect(diff.position('helloworld.js', 10)).to.equal(null);
        expect(diff.position('foo.js', 10)).to.equal(null);
      });
    });

    describe('wasAdded()', function() {
      it('should return true if an addition was made', function() {
        expect(diff.wasAdded('helloworld.js', 2)).to.equal(true);
      });

      it('should return false if no addition was made', function() {
        expect(diff.wasAdded('helloworld.js', 6)).to.equal(false);
      });
    });
  });
});
