/**
 * Constants module.
 */
module.exports = {
  /**
   * Jobs related constants.
   * @type {object}
   */
  jobs: {
    /**
     * Job name.
     * @type {string}
     */
    PR: 'PR',

    /**
     * Job name.
     * @type {string}
     */
    ESLINT: 'ESLint',

    /**
     * Job name.
     * @type {string}
     */
    COMMENTATOR: 'Commentator'
  },

  /**
   * Queue related constants.
   * @type {Object}
   */
  queue: {
    /**
     * Job got enqueued in a queue.
     * @type {string}
     */
    JOB_ENQUEUE: 'job enqueue',

    /**
     * Job got completed in a queue
     * @type {string}
     */
    JOB_COMPLETE: 'job complete'
  },

  /**
   * Individual job related constants.
   * @type {object}
   */
  job: {
    /**
     * Job got completed.
     * @type {string}
     */
    COMPLETE: 'complete'
  }
};
