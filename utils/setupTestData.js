/**
 * Script to set up test data files
 * This script will create the Excel test data file from the JSON data
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Paths
const dataDir = path.resolve(__dirname, '../data/testData');
const jsonPath = path.join(dataDir, 'transactions.json');
const excelPath = path.join(dataDir, 'transactions.xlsx');

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Load JSON data
 * @param {string} filePath - Path to JSON file
 * @returns {Object} - JSON data
 */
function loadJsonData(filePath) {
  console.log(`Loading JSON data from: ${filePath}`);
  const rawData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(rawData);
}

/**
 * Transform data from JSON format to Excel format
 * @param {Object} jsonData - JSON data
 * @returns {Array} - Array of objects for Excel
 */
function transformDataForExcel(jsonData) {
  const excelData = [];
  
  Object.entries(jsonData).forEach(([key, value]) => {
    excelData.push({
      id: value.id || key,
      description: value.description,
      priority: value.priority,
      category: value.category,
      currency: value.data.currency,
      amount: value.data.amount,
      type: value.data.type,
      simulateTimeout: value.data.simulateTimeout || false,
      expectedStatus: value.expected.status,
      expectedTransactionStatus: value.expected.transactionStatus || '',
      expectedOutcome: value.expected.outcome || '',
      expectedError: value.expected.error || ''
    });
  });
  
  return excelData;
}

/**
 * Create Excel file from data
 * @param {Array} data - Array of objects for Excel
 * @param {string} filePath - Path to save Excel file
 */
function createExcelFile(data, filePath) {
  console.log(`Creating Excel file at: ${filePath}`);
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  XLSX.writeFile(workbook, filePath);
  console.log('Excel file created successfully.');
}

/**
 * Main function
 */
function main() {
  try {
    console.log('Setting up test data...');
    
    // Ensure the data directory exists
    ensureDirectoryExists(dataDir);
    
    // Check if JSON file exists
    if (!fs.existsSync(jsonPath)) {
      console.error(`Error: JSON file not found at ${jsonPath}`);
      process.exit(1);
    }
    
    // Load JSON data
    const jsonData = loadJsonData(jsonPath);
    
    // Transform to Excel format
    const excelData = transformDataForExcel(jsonData);
    
    // Create Excel file
    createExcelFile(excelData, excelPath);
    
    console.log('Test data setup complete.');
  } catch (error) {
    console.error('Error setting up test data:', error.message);
    process.exit(1);
  }
}

// Execute main function
main();