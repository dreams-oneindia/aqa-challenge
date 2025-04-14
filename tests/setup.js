const dotenv = require('dotenv');
const path = require('path');
const ReporterFactory = require('../lib/reporting/reporterFactory');
const WalletApiMock = require('../lib/api/walletApiMock');

// Load environment variables
dotenv.config();

// Determine if we should use mock API
const useMock = process.env.USE_MOCK_API === 'true';

// Get reporting configuration
const reportType = process.env.REPORT_TYPE || 'console';
const outputDir = path.resolve(process.env.REPORT_OUTPUT_DIR || 
  (reportType === 'allure' ? './allure-results' : './reports'));

// Create the appropriate reporter
global.reporter = ReporterFactory.createReporter();
global.reportConfig = { type: reportType, outputDir };

// Create API client (mock or real)
global.apiClient = useMock ? new WalletApiMock() : null;

// Setup Jest lifecycle hooks
beforeAll(() => {
  // Global setup before all tests
  console.log(`Starting API test suite using ${useMock ? 'MOCK' : 'REAL'} API...`);
  console.log(`Using ${reportType.toUpperCase()} reporter`);
});

afterAll(() => {
  // Global teardown after all tests
  console.log('\nAPI test suite completed.');
  
  // Display Allure report path if using Allure
  if (reportType.toLowerCase() === 'allure') {
    console.log('\n==============================================================');
    console.log('📊 ALLURE REPORT INFORMATION:');
    console.log('==============================================================');
    console.log(`Report data saved to: ${outputDir}`);
    console.log('To generate and view the Allure report, run:');
    console.log('\n  npm run report');
    console.log('\nThis will generate the HTML report and open it in your browser.');
    console.log('==============================================================');
  }
});