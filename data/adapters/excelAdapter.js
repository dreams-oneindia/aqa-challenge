const XLSX = require('xlsx');
const path = require('path');
const Adapter = require('./adapter');

/**
 * Adapter for Excel data sources
 * Implements the Adapter interface for Excel files
 */
class ExcelAdapter extends Adapter {
  /**
   * Constructor for the Excel adapter
   * @param {string} sourcePath - Path to the Excel file
   * @param {string} sheetName - Name of the sheet to load (optional)
   */
  constructor(sourcePath, sheetName = null) {
    super(sourcePath);
    this.sheetName = sheetName;
  }
  
  /**
   * Load data from the Excel file
   * @returns {Promise<Array>} - Array of data objects
   */
  async loadData() {
    try {
      const filePath = path.resolve(this.sourcePath);
      const workbook = XLSX.readFile(filePath, {
        cellDates: true, // Convert Excel dates to JS dates
        dateNF: 'yyyy-mm-dd' // Date format
      });
      
      // Use specified sheet or first sheet
      const sheet = this.sheetName 
        ? workbook.Sheets[this.sheetName]
        : workbook.Sheets[workbook.SheetNames[0]];
      
      if (!sheet) {
        throw new Error(`Sheet "${this.sheetName || workbook.SheetNames[0]}" not found in Excel file`);
      }
      
      // Convert to JSON with headers
      return XLSX.utils.sheet_to_json(sheet, { 
        defval: null, // Default value for empty cells
        raw: false // Don't convert types
      });
    } catch (error) {
      console.error(`Failed to load Excel data from ${this.sourcePath}:`, error.message);
      throw new Error(`Failed to load Excel data: ${error.message}`);
    }
  }
  
  /**
   * Get data for a specific test case
   * @param {string} testCase - Test case identifier
   * @returns {Promise<object>} - Test case data
   */
  async getTestData(testCase) {
    const data = await this.loadData();
    
    // Find the row with matching test case ID
    const testCaseData = data.find(row => 
      String(row.id) === String(testCase) || 
      String(row.testCase) === String(testCase)
    );
    
    if (!testCaseData) {
      throw new Error(`Test case '${testCase}' not found in Excel data`);
    }
    
    return testCaseData;
  }
  
  /**
   * Get all test cases
   * @returns {Promise<Array>} - Array of test case identifiers
   */
  async getTestCases() {
    const data = await this.loadData();
    
    // Extract test case IDs from each row
    return data.map(row => row.id || row.testCase)
      .filter(id => id !== undefined && id !== null);
  }
}

module.exports = ExcelAdapter;