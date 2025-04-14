/**
 * Test configuration
 * Contains test-specific configurations that don't belong in environment config
 */
const { getEnvironment } = require('./environments');

const config = {
  // Test data configuration
  dataSource: process.env.DATA_SOURCE || 'json', // 'json' or 'excel'
  
  // Reporting configuration
  reporting: {
    type: process.env.REPORT_TYPE || 'console', // 'allure' or 'console'
    outputDir: process.env.REPORT_OUTPUT_DIR || './reports',
    generateHtml: process.env.GENERATE_HTML_REPORT === 'true', // For console reporter
  },
  
  // Test execution configuration
  execution: {
    // Test case prioritization
    priority: {
      high: 1,
      medium: 2,
      low: 3
    },
    
    // Test case categorization
    categories: {
      smoke: 'smoke',
      regression: 'regression',
      e2e: 'e2e'
    },
    
    // Default tags to run if none specified
    defaultTags: ['smoke']
  }
};

/**
 * Get the current test configuration
 * @returns {object} The test configuration merged with the current environment
 */
const getConfig = () => {
  const env = getEnvironment();
  return {
    ...config,
    environment: env
  };
};

module.exports = {
  getConfig,
  config
};