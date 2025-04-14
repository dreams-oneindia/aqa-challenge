# Wallet API Test Suite

This project is a test automation suite for the Wallet API, focusing on testing wallet transactions and operations.

## 📋 Features

- **Modular Architecture**: Built with SOLID principles for maintainability
- **Data-Driven Testing**: Support for both JSON and Excel test data sources
- **Comprehensive Reporting**: Multiple reporting options including Allure and HTML
- **Mock API Support**: Run tests without a real backend using the included mock API
- **Extensible Framework**: Easy to add new test cases and data sources

## 🔧 Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Test Data Setup

The project uses both JSON and Excel files for test data:

- **JSON**: `data/testData/transactions.json` is the primary source of test data
- **Excel**: `data/testData/transactions.xlsx` is automatically generated from the JSON data

You can regenerate the Excel file at any time with:

```bash
npm run setup
```

### Mock API

The project includes a mock implementation of the Wallet API for testing without a real backend. To use the mock API:

1. In the `.env` file, set:
   ```
   USE_MOCK_API=true
   ```

2. Run the tests as usual:
   ```bash
   npm test
   ```

To switch back to the real API, set `USE_MOCK_API=false` in the `.env` file.

## 🚀 Running Tests

### Running All Tests

```bash
npm test
```

### Running Specific Test Suites

```bash
# Run all wallet tests
npm run test:wallet

# Run transaction tests only
npm run test:transaction
```

## 📊 Reporting Options

The framework supports multiple reporting options:

### Console Reporter

The default reporter displays test results in the console with detailed steps, attachments, and colorized output.

To use the console reporter, set in `.env`:
```
REPORT_TYPE=console
```

### Allure Reporter

For more comprehensive reporting with charts, graphs, and test history, you can use Allure:

To use the Allure reporter, set in `.env`:
```
REPORT_TYPE=allure
REPORT_OUTPUT_DIR=./allure-results
```

Generate and open the Allure report:
```bash
npm run report
```

This will create the report and open it in your default browser.

## 📁 Project Structure

```
wallet-api-test-suite/
├── config/                      # Configuration files
├── data/                        # Test data and data adapters
│   ├── adapters/                # Data source adapters
│   └── testData/                # Test data files
├── lib/                         # Library code
│   ├── api/                     # API clients
│   │   ├── apiClient.js         # Base API client
│   │   ├── walletApi.js         # Wallet API client
│   │   └── walletApiMock.js     # Mock implementation
│   ├── reporting/               # Reporting utilities
│   │   ├── reporter.js          # Base reporter interface
│   │   ├── allureReporter.js    # Allure reporter
│   │   ├── consoleReporter.js   # Console reporter
│   │   └── reporterFactory.js   # Reporter factory
│   └── utils/                   # Utility functions
├── utils/                       # Utility scripts
├── tests/                       # Test files
│   └── wallet/                  # Wallet-specific tests
├── .env                         # Environment variables
├── jest.config.js               # Jest configuration
└── package.json                 # Package configuration
```

## 🧪 Test Strategy

The test suite focuses on:

1. **Wallet Transaction Testing**: Testing the creation and processing of wallet transactions
2. **Wallet Operations**: Testing wallet retrieval and management

For more details on the test cases, see the [TESTPLAN.md](./TESTPLAN.md) file.

## 🔌 Extending the Framework

### Enhancing Test Suites

1. Parameterize test suites to execute same test cases for multiple test data
2. Segregating test suites as per Smoke/Sanity/Regression

### Enhancing the Mock API

1. Update `lib/api/walletApiMock.js` to add new behaviors or fix issues
2. The mock API is designed to simulate the real API, including delays and error cases

## 📝 Assumptions

- The test user has permission to perform all operations
- The API follows the OpenAPI specification exactly as documented
- Transaction processing works as described, with support for both immediate and delayed responses
- Authentication tokens are valid for 1 hr (as specified)
- The API returns appropriate HTTP status codes for success and error cases

## 🔒 Security

- API credentials are stored in the `.env` file, which is not committed to the repository
- Bearer tokens are not logged in test output

## 📚 Dependencies

- **Jest**: Test runner and assertions
- **Axios**: HTTP client for API requests
- **Allure**: Test reporting
- **xlsx**: Excel file parsing
- **dotenv**: Environment variable management
- **uuid**: UUID generation

## 👥 Authors and Acknowledgment

- Rashmi Sharma - Initial work


## LLM Usage Disclosure

During the development of this test automation framework, we utilized the following AI assistance tools:

- **Claude 3.7 Sonnet**: Used for creating documentation, including JSON-to-Excel conversion utilities and test data generation.

- **GitHub Copilot**: Used within VS Code for accelerating code development.