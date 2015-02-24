var env = process.env;

module.exports = {
  /**
   * Application related config.
   * @type {object}
   */
  app: {
    /**
     * In debug mode or not.
     * @type {boolean}
     */
    DEBUG: false || env.DEBUG
  },

  /**
   * API related config.
   * @type {object}
   */
  api: {
    /**
     * API secret.
     * @type {string}
     */
    SECRET: env.API_SECRET || 'secret'
  },

  /**
   * Redis config.
   * @type {object}
   */
  redis: {
    /**
     * Port number for Redis.
     * @type {int}
     */
    PORT: env.REDIS_PORT || 6379,

    /**
     * Host for Redis.
     * @type {string}
     */
    HOST: env.REDIS_HOST || '127.0.0.1',

    /**
     * Auth for Redis.
     * @type {string}
     */
    AUTH: env.REDIS_AUTH || ''
  },

  /**
   * Github config.
   * @type {object}
   */
  github: {
    /**
     * Github API token.
     * @type {string}
     */
    TOKEN: env.GITHUB_TOKEN || '',

    /**
     * Supported Github events and actions.
     * @type {object}
     */
    EVENTS: {
      'pull_request': ['opened', 'reopened', 'synchronize']
    }
  },

  /**
   * Workers config.
   * @type {object}
   */
  workers: {
    /**
     * PR specific config.
     * @type {object}
     */
    pr: {
      /**
       * Project config file.
       * @type {string}
       */
      CONFIG_FILE: '.tinker.yml'
    }
  }
};
