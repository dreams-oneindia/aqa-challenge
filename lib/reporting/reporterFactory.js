const { AllureReporter } = require('./allureReporter');
const { ConsoleReporter } = require('./consoleReporter');
const { getConfig } = require('../../config/testConfig');

/**
 * Factory for creating reporters
 * This allows us to use different reporters based on configuration
 */
class ReporterFactory {
  /**
   * Create a reporter based on the configuration
   * @param {string} type - Reporter type
   * @returns {Reporter} - Reporter instance
   */
  static createReporter(type = null) {
    // If type is not provided, get it from config
    const reportType = type || getConfig().reporting.type;
    console.log(`Creating reporter of type: ${reportType}`);
    switch (reportType.toLowerCase()) {
      case 'allure':
        return new AllureReporter();
      case 'console':
        return new ConsoleReporter();
      default:
        console.warn(`Reporter type "${reportType}" not found, using console reporter.`);
        return new ConsoleReporter();
    }
  }
}

module.exports = ReporterFactory;