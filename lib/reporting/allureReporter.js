const Reporter = require('./reporter');
const { allure } = require('jest-allure/dist/setup');

/**
 * Allure reporter implementation using jest-allure
 */
class AllureReporter extends Reporter {
  /**
   * Constructor for the Allure reporter
   */
  constructor() {
    super();
    this.currentTest = null;
    this.currentSuite = null;
  }
  
  /**
   * Start a test suite
   * @param {string} suiteName - Name of the test suite
   */
  startSuite(suiteName) {
    this.currentSuite = suiteName;
    allure.epic(suiteName);
    
    console.log(`\n==== Starting Test Suite: ${suiteName} ====`);
  }
  
  /**
   * End a test suite
   * @param {string} suiteName - Name of the test suite
   */
  endSuite(suiteName) {
    this.currentSuite = null;
    console.log(`==== Completed Test Suite: ${suiteName} ====\n`);
  }
  
  /**
   * Start a test case
   * @param {string} testName - Name of the test case
   * @param {object} metadata - Additional metadata for the test case
   */
  startTest(testName, metadata = {}) {
    this.currentTest = testName;
    
    // Add test details to Allure
    if (metadata.description) {
      allure.description(metadata.description);
    }
    
    if (metadata.severity) {
      allure.severity(metadata.severity);
    }
    
    if (metadata.category) {
      allure.feature(metadata.category);
    }
    
    // You can add more metadata as tags
    const tags = [];
    if (metadata.severity) tags.push(metadata.severity);
    if (metadata.category) tags.push(metadata.category);
    
    if (tags.length > 0) {
      allure.tag(...tags);
    }
    
    console.log(`\n---- Starting Test: ${testName} ----`);
    if (metadata.description) {
      console.log(`Description: ${metadata.description}`);
    }
    
    if (metadata.severity) {
      console.log(`Severity: ${metadata.severity}`);
    }
    
    if (metadata.category) {
      console.log(`Category: ${metadata.category}`);
    }
  }
  
  /**
   * End a test case
   * @param {string} status - Test status (passed, failed, skipped)
   * @param {object} metadata - Additional metadata for the test case
   */
  endTest(status, metadata = {}) {
    if (metadata.error) {
      allure.testAttachment('Error Details', JSON.stringify({
        message: metadata.error.message,
        stack: metadata.error.stack
      }, null, 2), 'application/json');
    }
    
    console.log(`---- Completed Test: ${this.currentTest} (${status}) ----\n`);
    this.currentTest = null;
  }
  
  /**
   * Add an attachment to the report
   * @param {string} name - Name of the attachment
   * @param {any} content - Content of the attachment
   * @param {string} type - MIME type of the attachment
   */
  addAttachment(name, content, type) {
    let contentType;
    let attachmentContent;
    
    // Handle different content types
    switch (type) {
      case 'json':
        contentType = 'application/json';
        attachmentContent = typeof content === 'object' 
          ? JSON.stringify(content, null, 2) 
          : content;
        break;
      case 'html':
        contentType = 'text/html';
        attachmentContent = content;
        break;
      case 'xml':
        contentType = 'application/xml';
        attachmentContent = content;
        break;
      case 'csv':
        contentType = 'text/csv';
        attachmentContent = content;
        break;
      default:
        contentType = 'text/plain';
        attachmentContent = String(content);
    }
    
    // Add attachment to Allure
    allure.testAttachment(name, attachmentContent, contentType);
    
    // Print formatted preview
    let preview;
    try {
      if (typeof content === 'object') {
        preview = JSON.stringify(content).substring(0, 100) + '...';
      } else {
        preview = String(content).substring(0, 100) + '...';
      }
    } catch (e) {
      preview = '[Error creating preview]';
    }
    
    console.log(`    [Attachment] ${name} (${type})`);
    console.log(`    Preview: ${preview}`);
  }
  
  /**
   * Log a message to the report
   * @param {string} message - Message to log
   * @param {string} level - Log level (info, warning, error)
   */
  log(message, level = 'info') {
    // Add log as a step with appropriate status
    const status = level === 'error' ? 'failed' : level === 'warning' ? 'broken' : 'passed';
    this.addStep(`[${level.toUpperCase()}] ${message}`, status);
  }
  
  /**
   * Add a step to the report
   * @param {string} name - Name of the step
   * @param {string} status - Step status (passed, failed, skipped)
   * @param {object} metadata - Additional metadata for the step
   */
  addStep(name, status = 'passed', metadata = {}) {
    // Map our status to Allure status
    const allureStatus = this._mapStatus(status);
    
    // Add step to Allure
    allure.step(name, () => {
      // If step failed and has error, add it to the step
      if (status === 'failed' && metadata.error) {
        allure.attachment(
          'Error',
          JSON.stringify({
            message: metadata.error.message || String(metadata.error),
            stack: metadata.error.stack || 'No stack trace'
          }, null, 2),
          'application/json'
        );
        
        // For Allure to mark the step as failed, we need to throw inside
        throw new Error(metadata.error.message || String(metadata.error));
      }
    });
    
    // Log step to console with appropriate icon
    const statusIcon = status === 'passed' ? '✓' : status === 'failed' ? '✗' : '⚠';
    console.log(`    ${statusIcon} ${name}`);
    
    // Log error if present
    if (metadata.error) {
      console.error(`      Error: ${metadata.error.message || String(metadata.error)}`);
      if (metadata.error.stack) {
        console.error(`      Stack: ${metadata.error.stack.split('\n')[0]}`);
      }
    }
  }
  
  /**
   * Map our status to Allure status
   * @private
   * @param {string} status - Our status
   * @returns {string} - Allure status
   */
  _mapStatus(status) {
    switch (status) {
      case 'passed': return 'passed';
      case 'failed': return 'failed';
      case 'skipped': return 'skipped';
      case 'broken': return 'broken';
      default: return 'passed';
    }
  }
}

module.exports = { AllureReporter };