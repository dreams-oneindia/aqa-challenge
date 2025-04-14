/**
 * Base Reporter interface
 * This follows the strategy pattern to allow different reporting strategies
 * to be used interchangeably.
 */
class Reporter {
    /**
     * Constructor for the base reporter
     */
    constructor() {
      if (this.constructor === Reporter) {
        throw new Error('Cannot instantiate abstract class');
      }
    }
    
    /**
     * Start a test suite
     * @abstract
     * @param {string} suiteName - Name of the test suite
     */
    startSuite(suiteName) {
      throw new Error('Method startSuite() must be implemented');
    }
    
    /**
     * End a test suite
     * @abstract
     * @param {string} suiteName - Name of the test suite
     */
    endSuite(suiteName) {
      throw new Error('Method endSuite() must be implemented');
    }
    
    /**
     * Start a test case
     * @abstract
     * @param {string} testName - Name of the test case
     * @param {object} metadata - Additional metadata for the test case
     */
    startTest(testName, metadata = {}) {
      throw new Error('Method startTest() must be implemented');
    }
    
    /**
     * End a test case
     * @abstract
     * @param {string} status - Test status (passed, failed, skipped)
     * @param {object} metadata - Additional metadata for the test case
     */
    endTest(status, metadata = {}) {
      throw new Error('Method endTest() must be implemented');
    }
    
    /**
     * Add an attachment to the report
     * @abstract
     * @param {string} name - Name of the attachment
     * @param {any} content - Content of the attachment
     * @param {string} type - MIME type of the attachment
     */
    addAttachment(name, content, type) {
      throw new Error('Method addAttachment() must be implemented');
    }
    
    /**
     * Log a message to the report
     * @abstract
     * @param {string} message - Message to log
     * @param {string} level - Log level (info, warning, error)
     */
    log(message, level = 'info') {
      throw new Error('Method log() must be implemented');
    }
    
    /**
     * Add a step to the report
     * @abstract
     * @param {string} name - Name of the step
     * @param {string} status - Step status (passed, failed, skipped)
     * @param {object} metadata - Additional metadata for the step
     */
    addStep(name, status, metadata = {}) {
      throw new Error('Method addStep() must be implemented');
    }
  }
  
  module.exports = Reporter;