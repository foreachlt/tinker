module.exports = {
  /**
   * Worker related constants.
   * @type {object}
   */
  workers: {
    /**
     * Worker name.
     * @type {string}
     */
    PR: 'PR',

    /**
     * Worker name.
     * @type {string}
     */
    ESLINT: 'ESLint',

    /**
     * Worker name.
     * @type {string}
     */
    COMMENTATOR: 'Commentator'
  },

  /**
   * Job related constants.
   * @type {Object}
   */
  jobs: {
    /**
     * Job enqueue event.
     * @type {string}
     */
    ENQUEUE: 'job enqueue',

    /**
     * Job complete event.
     * @type {string}
     */
    COMPLETE: 'job complete'
  }
};
