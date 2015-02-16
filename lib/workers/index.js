module.exports = {
  /**
   * A worker for processing pull requests.
   * @type {PRWorker}
   */
  PR: require('./pr'),

  /**
   * A worker for processing ESLint validations.
   * @type {ESLintWorker}
   */
  ESLint: require('./eslint'),

  /**
   * A worker for processing comments.
   * @type {CommentatorWorker}
   */
  Commentator: require('./commentator')
};
