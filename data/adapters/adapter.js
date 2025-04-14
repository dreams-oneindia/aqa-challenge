/**
 * Base Adapter interface for data sources
 * This follows the adapter pattern to allow different data sources
 * to be used interchangeably.
 */
class Adapter {
    /**
     * Constructor for the base adapter
     * @param {string} sourcePath - Path to the data source
     */
    constructor(sourcePath) {
      if (this.constructor === Adapter) {
        throw new Error('Cannot instantiate abstract class');
      }
      this.sourcePath = sourcePath;
    }
    
    /**
     * Load data from the source
     * @abstract
     * @returns {Promise<Array>} - Array of data objects
     */
    async loadData() {
      throw new Error('Method loadData() must be implemented');
    }
    
    /**
     * Get data for a specific test case
     * @abstract
     * @param {string} testCase - Test case identifier
     * @returns {Promise<object>} - Test case data
     */
    async getTestData(testCase) {
      throw new Error('Method getTestData() must be implemented');
    }
    
    /**
     * Get all test cases
     * @abstract
     * @returns {Promise<Array>} - Array of test case identifiers
     */
    async getTestCases() {
      throw new Error('Method getTestCases() must be implemented');
    }
  }
  
  module.exports = Adapter;