var queue = require('../../queue')
  , cc = require('../../constants');

module.exports = {
  payload: function(req, res) {
    queue.create(cc.jobs.PR, { pr: req.body }).save(function(err) {
      if (!err) return res.status(201).end();

      return res.status(500).end();
    });
  }
}
