/**
 * Environment configuration for the test suite
 * Different environments (dev, test, staging) can be configured here
 */
const environments = {
    dev: {
      baseUrl: process.env.API_BASE_URL || 'https://challenge.test.local/challenge/api/v1',
      serviceId: process.env.SERVICE_ID || 'test-service-id',
      auth: {
        username: process.env.TEST_USERNAME || 'testuser',
        password: process.env.TEST_PASSWORD || 'testpassword',
      },
      timeouts: {
        request: 10000, // 10 seconds
        transaction: 30 * 60 * 1000, // 30 minutes in milliseconds
      }
    },
    test: {
      baseUrl: process.env.TEST_API_BASE_URL || 'https://challenge.test.local/challenge/api/v1',
      serviceId: process.env.TEST_SERVICE_ID || 'test-service-id',
      auth: {
        username: process.env.TEST_USERNAME || 'testuser',
        password: process.env.TEST_PASSWORD || 'testpassword',
      },
      timeouts: {
        request: 10000, // 10 seconds
        transaction: 30 * 60 * 1000, // 30 minutes in milliseconds
      }
    }
  };
  
  /**
   * Get the configuration for a specific environment
   * @param {string} env - The environment name
   * @returns {object} - The environment configuration
   */
  const getEnvironment = (env = process.env.TEST_ENV || 'dev') => {
    if (!environments[env]) {
      console.warn(`Environment "${env}" not found, using dev environment.`);
      return environments.dev;
    }
    return environments[env];
  };
  
  module.exports = {
    getEnvironment,
    environments
  };