module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/setup.js', 'jest-allure/dist/setup'],
    testMatch: ['**/tests/**/*.test.js'],
    reporters: [
      'default',
      ['jest-allure', {
        resultsDir: process.env.REPORT_OUTPUT_DIR || './allure-results'
      }]
    ],
    verbose: true,
    testTimeout: 30000,
    // Add global jest setup config for reporter compatibility
    globals: {
      // This helps with reporter compatibility
      testPath: process.cwd()
    },
    // Use the jasmine2 test runner for compatibility with jest-allure
    testRunner: 'jasmine2'
  };