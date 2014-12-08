var env = process.env;

module.exports = {
  /**
   * API related config.
   * @type {object}
   */
  api: {
    /**
     * Port number for the API.
     * @type {int}
     */
    PORT: env.PORT || 3000,

    /**
     * API secret.
     * @type {string}
     */
    SECRET: env.API_SECRET || 'ad22e95e3f84e5c01507830c60a446e2bf4aa14a',
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
     * Github client debugging.
     * @type {boolean}
     */
    DEBUG: env.GITHUB_DEBUG || false,

    /**
     * Github API token.
     * @type {string}
     */
    TOKEN: env.GITHUB_TOKEN || 'github-token',

    /**
     * Supported Github events and actions.
     * @type {object}
     */
    EVENTS: {
      'pull_request': ['opened', 'synchronize']
    }
  }
};