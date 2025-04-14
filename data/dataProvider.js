const path = require('path');
const JsonAdapter = require('./adapters/jsonAdapter');
const ExcelAdapter = require('./adapters/excelAdapter');
const { getConfig } = require('../config/testConfig');

/**
 * Factory class for creating data adapters
 * Provides a unified interface for accessing test data
 * from different sources.
 */
class DataProvider {
  /**
   * Create a new DataProvider
   * @param {string} dataType - Type of data to provide ('transaction', etc.)
   * @param {string} sourceType - Type of source ('json', 'excel')
   */
  constructor(dataType, sourceType = null) {
    this.dataType = dataType;
    this.sourceType = sourceType || getConfig().dataSource;
    this.adapter = this._createAdapter();
  }
  
  /**
   * Create the appropriate adapter based on source type
   * @private
   * @returns {Adapter} - Data adapter instance
   */
  _createAdapter() {
    const basePath = path.resolve(__dirname, 'testData');
    
    switch (this.sourceType.toLowerCase()) {
      case 'json':
        return new JsonAdapter(path.join(basePath, `${this.dataType}.json`));
      case 'excel':
        return new ExcelAdapter(path.join(basePath, `${this.dataType}.xlsx`));
      default:
        throw new Error(`Unsupported data source type: ${this.sourceType}`);
    }
  }
  
  /**
   * Get data for a specific test case
   * @param {string} testCase - Test case identifier
   * @returns {Promise<object>} - Test case data
   */
  async getTestData(testCase) {
    return this.adapter.getTestData(testCase);
  }
  
  /**
   * Get all test cases
   * @returns {Promise<Array>} - Array of test case identifiers
   */
  async getTestCases() {
    return this.adapter.getTestCases();
  }
  
  /**
   * Load all data
   * @returns {Promise<Array>} - Array of data objects
   */
  async loadData() {
    return this.adapter.loadData();
  }
}

module.exports = DataProvider;