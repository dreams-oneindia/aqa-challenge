const fs = require('fs').promises;
const path = require('path');
const Adapter = require('./adapter');

/**
 * Adapter for JSON data sources
 * Implements the Adapter interface for JSON files
 */
class JsonAdapter extends Adapter {
  /**
   * Load data from the JSON file
   * @returns {Promise<Array>} - Array of data objects
   */
  async loadData() {
    try {
      const filePath = path.resolve(this.sourcePath);
      const rawData = await fs.readFile(filePath, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error(`Failed to load JSON data from ${this.sourcePath}:`, error.message);
      throw new Error(`Failed to load JSON data: ${error.message}`);
    }
  }
  
  /**
   * Get data for a specific test case
   * @param {string} testCase - Test case identifier
   * @returns {Promise<object>} - Test case data
   */
  async getTestData(testCase) {
    const data = await this.loadData();
    
    // If data is an array of test cases with id property
    if (Array.isArray(data)) {
      const testCaseData = data.find(item => item.id === testCase || item.testCase === testCase);
      if (!testCaseData) {
        throw new Error(`Test case '${testCase}' not found in data source`);
      }
      return testCaseData;
    }
    
    // If data is an object with test cases as keys
    if (data[testCase]) {
      return data[testCase];
    }
    
    throw new Error(`Test case '${testCase}' not found in data source`);
  }
  
  /**
   * Get all test cases
   * @returns {Promise<Array>} - Array of test case identifiers
   */
  async getTestCases() {
    const data = await this.loadData();
    
    // If data is an array of test cases with id property
    if (Array.isArray(data)) {
      return data.map(item => item.id || item.testCase);
    }
    
    // If data is an object with test cases as keys
    return Object.keys(data);
  }
}

module.exports = JsonAdapter;