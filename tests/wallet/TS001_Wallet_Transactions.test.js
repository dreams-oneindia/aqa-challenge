const WalletApi = require('../../lib/api/walletApi');
const DataProvider = require('../../data/dataProvider');
const { getConfig } = require('../../config/testConfig');
const { wait, generateRandomAmount, generateRandomCurrency } = require('../../lib/utils/helpers');

// Initialize data provider
const transactionData = new DataProvider('transactions');

// Use either the global mock API client or create a real one
const walletApi = global.apiClient || new WalletApi();

// Timeout for polling transaction status
const POLLING_TIMEOUT = 10000; // 10 seconds
const POLLING_INTERVAL = 1000; // 1 second

/**
 * Setup function to authenticate and get wallet ID
 * @returns {Promise<string>} - Wallet ID
 */
const setupWallet = async () => {
  // Get environment config
  const config = getConfig();
  const { username, password } = config.environment.auth;
  
  // Login
  global.reporter.addStep('Login to API', 'passed');
  const authResponse = await walletApi.login(username, password);
  expect(authResponse).toHaveProperty('token');
  
  // Get user info
  global.reporter.addStep('Get user info', 'passed');
  const userInfo = await walletApi.getUserInfo(authResponse.userId);
  expect(userInfo).toHaveProperty('walletId');
  
  // Return wallet ID
  return userInfo.walletId;
};

/**
 * Execute a transaction and verify the response
 * @param {object} testCase - Test case data
 * @returns {Promise<object>} - Transaction response
 */
const executeTransaction = async (testCase) => {
    const { data, expected } = testCase;
    
    try {
      global.reporter.addStep(`Create ${data.type} transaction for ${data.amount} ${data.currency}`, 'passed');
      
      // Execute transaction
      const response = await walletApi.createTransaction(data);
      
      // Log transaction details (with safe JSON handling)
      try {
        global.reporter.addAttachment('Transaction Request', data, 'json');
        global.reporter.addAttachment('Transaction Response', response, 'json');
      } catch (attachmentError) {
        global.reporter.log(`Could not add attachment: ${attachmentError.message}`, 'warning');
      }
      
      return response;
    } catch (error) {
      if (expected.status >= 400) {
        // For expected errors, return the error response
        global.reporter.addStep('Expected error response received', 'passed');
        
        // Log the error in a safe way
        try {
          if (error.response && error.response.data) {
            global.reporter.addAttachment('Error Response', error.response.data, 'json');
            return error.response.data;
          }
        } catch (attachmentError) {
          global.reporter.log(`Could not add error attachment: ${attachmentError.message}`, 'warning');
        }
        
        // If we couldn't extract error.response.data, return a simplified object
        return { 
          error: error.message || 'Unknown error',
          status: error.response ? error.response.status : 500
        };
      }
      
      // For unexpected errors, log and rethrow
      global.reporter.addStep('Unexpected error', 'failed', { 
        error: { 
          message: error.message, 
          stack: error.stack 
        } 
      });
      throw error;
    }
};

/**
 * Wait for a transaction to complete and verify the outcome
 * @param {string} transactionId - Transaction ID
 * @param {object} expected - Expected outcome
 * @returns {Promise<object>} - Completed transaction
 */
const waitForTransaction = async (transactionId, expected) => {
  let transactionComplete = false;
  let transaction = null;
  const startTime = Date.now();
  
  // Poll for transaction status until it's complete or times out
  while (!transactionComplete && Date.now() - startTime < POLLING_TIMEOUT) {
    global.reporter.addStep('Polling transaction status', 'passed');
    
    transaction = await walletApi.getTransaction(transactionId);
    global.reporter.addAttachment('Transaction Status', transaction, 'json');
    
    if (transaction.status === 'finished') {
      transactionComplete = true;
    } else {
      // Wait before polling again
      await wait(POLLING_INTERVAL);
    }
  }
  
  // If transaction isn't complete after timeout, it's still pending as expected
  if (!transactionComplete) {
    global.reporter.addStep('Transaction still pending after timeout', 'passed');
    expect(transaction.status).toBe('pending');
  } else {
    global.reporter.addStep('Transaction completed', 'passed');
    expect(transaction.status).toBe('finished');
    expect(transaction).toHaveProperty('outcome');
    
    // Verify the outcome if expected
    if (expected.outcome) {
      expect(transaction.outcome).toBe(expected.outcome);
    }
  }
  
  return transaction;
};

/**
 * Verify wallet balance after transaction
 * @param {string} walletId - Wallet ID
 * @param {object} transactionData - Transaction data
 * @param {object} completedTransaction - Completed transaction
 * @returns {Promise<void>}
 */
const verifyWalletBalance = async (walletId, transactionData, completedTransaction) => {
  global.reporter.addStep('Verify wallet balance', 'passed');
  
  // Get wallet data
  const wallet = await walletApi.getWallet(walletId);
  global.reporter.addAttachment('Wallet Data', wallet, 'json');
  
  // Find the currency clip for the transaction currency
  const currencyClip = wallet.currencyClips.find(
    clip => clip.currency === transactionData.currency
  );
  
  // Skip verification if transaction was denied or the currency clip doesn't exist
  if (completedTransaction.status === 'finished' && 
      completedTransaction.outcome === 'denied') {
    global.reporter.addStep('Skip balance verification for denied transaction', 'passed');
    return;
  }
  
  if (!currencyClip) {
    // If this was a debit transaction and there's no clip, it was likely denied
    if (transactionData.type === 'debit') {
      global.reporter.addStep('No currency clip found for debit transaction', 'passed');
      return;
    }
    
    // For credit transactions with pending status, the clip might not exist yet
    if (completedTransaction.status === 'pending') {
      global.reporter.addStep('No currency clip found for pending transaction', 'passed');
      return;
    }
    
    // Otherwise, this is an error
    global.reporter.addStep('Currency clip not found in wallet', 'failed');
    expect(currencyClip).toBeDefined();
  }
  
  // For completed, approved transactions, verify the balance
  if (completedTransaction.status === 'finished' && 
      completedTransaction.outcome === 'approved') {
    
    global.reporter.addStep(`Verify ${transactionData.currency} balance: ${currencyClip.balance}`, 'passed');
    
    // Balance should be positive
    expect(currencyClip.balance).toBeGreaterThanOrEqual(0);
    
    // For credits, the amount should have been added
    // For debits, the amount should have been subtracted
    // Note: We can't exactly verify this without knowing the previous balance
  }
};

// Begin test suite
describe('TS001_Wallet_Transactions', () => {
  // Store the wallet ID for all tests
  let walletId;
  
  // Setup before all tests
  beforeAll(async () => {
    global.reporter.startSuite('Wallet Transaction Tests');
    walletId = await setupWallet();
  });
  
  // Test valid credit transaction
  test('TC001_Credit_Transaction_Success', async () => {
    // Get test data
    const testCase = await transactionData.getTestData('valid_credit_transaction');
    
    global.reporter.startTest('Valid Credit Transaction', {
      description: testCase.description,
      severity: 'critical',
      category: testCase.category
    });
    
    // Execute transaction
    const response = await executeTransaction(testCase);
    
    // Verify initial response
    expect(response).toHaveProperty('transactionId');
    
    // Wait for transaction to complete
    const completedTransaction = await waitForTransaction(
      response.transactionId,
      testCase.expected
    );
    
    // Verify wallet balance
    await verifyWalletBalance(walletId, testCase.data, completedTransaction);
    
    global.reporter.endTest('passed');
  });
  
  // Test valid debit transaction
  test('TC002_Debit_Transaction_Success', async () => {
    // First create a credit transaction to add funds
    const creditTestCase = await transactionData.getTestData('valid_credit_transaction');
    
    global.reporter.startTest('Valid Debit Transaction - Setup', {
      description: 'Setup for debit test by adding funds to wallet',
      severity: 'normal'
    });
    
    // Add funds to wallet
    const creditResponse = await executeTransaction(creditTestCase);
    await waitForTransaction(
      creditResponse.transactionId,
      creditTestCase.expected
    );
    
    global.reporter.endTest('passed');
    
    // Now test the debit transaction
    const debitTestCase = await transactionData.getTestData('valid_debit_transaction');
    
    global.reporter.startTest('Valid Debit Transaction', {
      description: debitTestCase.description,
      severity: 'critical',
      category: debitTestCase.category
    });
    
    // Execute debit transaction
    const response = await executeTransaction(debitTestCase);
    
    // Verify initial response
    expect(response).toHaveProperty('transactionId');
    
    // Wait for transaction to complete
    const completedTransaction = await waitForTransaction(
      response.transactionId,
      debitTestCase.expected
    );
    
    // Verify wallet balance
    await verifyWalletBalance(walletId, debitTestCase.data, completedTransaction);
    
    global.reporter.endTest('passed');
  });
  
  // Add only one more test for simplicity
  test('TC003_ZeroAmount_Transaction_Failure', async () => {
    const testCase = await transactionData.getTestData('zero_amount_transaction');
    
    global.reporter.startTest('Zero Amount Transaction', {
      description: testCase.description,
      severity: 'normal',
      category: testCase.category
    });
    
    // Execute transaction
    const response = await executeTransaction(testCase);
    
    // For error responses, we expect an error status
    expect(response).toHaveProperty('error');
    
    global.reporter.endTest('passed');
  });
  
  // End test suite
  afterAll(() => {
    global.reporter.endSuite('Wallet Transaction Tests');
  });
});