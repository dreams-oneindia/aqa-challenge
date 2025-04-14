const WalletApi = require('../../lib/api/walletApi');
const { getConfig } = require('../../config/testConfig');
const { getDateRange } = require('../../lib/utils/helpers');

// Initialize API client
const walletApi = global.apiClient || new WalletApi();

/**
 * Setup function to authenticate and get wallet ID
 * @returns {Promise<string>} - Wallet ID
 */
const setupWallet = async () => {
  // Get environment config
  const config = getConfig();
  const { username, password } = config.environment.auth;
  
  // Login
  reporter.addStep('Login to API', 'passed');
  const authResponse = await walletApi.login(username, password);
  expect(authResponse).toHaveProperty('token');
  
  // Get user info
  reporter.addStep('Get user info', 'passed');
  const userInfo = await walletApi.getUserInfo(authResponse.userId);
  expect(userInfo).toHaveProperty('walletId');
  
  // Return wallet ID
  return userInfo.walletId;
};

// Begin test suite
describe('TS002_Wallet_Operations', () => {
  // Store the wallet ID for all tests
  let walletId;
  
  // Setup before all tests
  beforeAll(async () => {
    reporter.startSuite('Wallet Operations Tests');
    walletId = await setupWallet();
  });
  
  // Test retrieving wallet information
  test('TC001_WalletInformation_Retrieve_Success', async () => {
    reporter.startTest('Retrieve Wallet Information', {
      description: 'Verify that wallet information can be retrieved',
      severity: 'critical',
      category: 'smoke'
    });
    
    // Get wallet
    reporter.addStep('Retrieve wallet details', 'passed');
    const wallet = await walletApi.getWallet(walletId);
    
    // Verify wallet structure
    expect(wallet).toHaveProperty('walletId');
    expect(wallet.walletId).toBe(walletId);
    expect(wallet).toHaveProperty('currencyClips');
    expect(Array.isArray(wallet.currencyClips)).toBe(true);
    expect(wallet).toHaveProperty('createdAt');
    expect(wallet).toHaveProperty('updatedAt');
    
    // Log wallet details
    reporter.addAttachment('Wallet Details', wallet, 'json');
    
    reporter.endTest('passed');
  });
  
  // Test retrieving wallet transactions
  test('TC002_WalletTransactions_Retrieve_Success', async () => {
    reporter.startTest('Retrieve Wallet Transactions', {
      description: 'Verify that wallet transactions can be retrieved',
      severity: 'high',
      category: 'smoke'
    });
    
    // Get transactions without parameters
    reporter.addStep('Retrieve transactions without query parameters', 'passed');
    const transactions = await walletApi.getTransactions({}, walletId);
    
    // Verify transactions structure
    expect(transactions).toHaveProperty('transactions');
    expect(Array.isArray(transactions.transactions)).toBe(true);
    expect(transactions).toHaveProperty('totalCount');
    expect(transactions).toHaveProperty('currentPage');
    expect(transactions).toHaveProperty('totalPages');
    
    // Log transaction details
    reporter.addAttachment('Transactions List', transactions, 'json');
    
    reporter.endTest('passed');
  });
  
  // Test retrieving wallet transactions with pagination
  test('TC003_WalletTransactions_Pagination_Retrieve_Success', async () => {
    reporter.startTest('Retrieve Wallet Transactions With Pagination', {
      description: 'Verify that wallet transactions can be retrieved with pagination',
      severity: 'medium',
      category: 'regression'
    });
    
    // Get transactions with page parameter
    reporter.addStep('Retrieve transactions with page=1', 'passed');
    const transactions = await walletApi.getTransactions({ page: 1 }, walletId);
    
    // Verify transactions structure and pagination
    expect(transactions).toHaveProperty('transactions');
    expect(Array.isArray(transactions.transactions)).toBe(true);
    expect(transactions).toHaveProperty('currentPage');
    expect(transactions.currentPage).toBe(1);
    
    // Try second page if available
    if (transactions.totalPages > 1) {
      reporter.addStep('Retrieve transactions with page=2', 'passed');
      const pageTwo = await walletApi.getTransactions({ page: 2 }, walletId);
      
      expect(pageTwo).toHaveProperty('transactions');
      expect(Array.isArray(pageTwo.transactions)).toBe(true);
      expect(pageTwo).toHaveProperty('currentPage');
      expect(pageTwo.currentPage).toBe(2);
      
      // The transactions on page 1 and page 2 should be different
      const page1Ids = transactions.transactions.map(t => t.transactionId);
      const page2Ids = pageTwo.transactions.map(t => t.transactionId);
      
      // Check if there's any overlap between pages
      const overlap = page1Ids.some(id => page2Ids.includes(id));
      expect(overlap).toBe(false);
    }
    
    reporter.endTest('passed');
  });
  
  // Test retrieving wallet transactions with date filtering
  test('TC004_WalletTransactions_DateFiltering_Retrieve_Success', async () => {
    reporter.startTest('Retrieve Wallet Transactions With Date Filtering', {
      description: 'Verify that wallet transactions can be filtered by date range',
      severity: 'medium',
      category: 'regression'
    });
    
    // Get a date range for the last 30 days
    const { startDate, endDate } = getDateRange(-30, 0);
    
    // Get transactions with date range
    reporter.addStep(`Retrieve transactions from ${startDate} to ${endDate}`, 'passed');
    const transactions = await walletApi.getTransactions({
      startDate,
      endDate
    }, walletId);
    
    // Verify transactions structure
    expect(transactions).toHaveProperty('transactions');
    expect(Array.isArray(transactions.transactions)).toBe(true);
    
    // Verify that all returned transactions are within the date range
    // Note: This assumes the API returns created dates, not updated dates
    const allInRange = transactions.transactions.every(transaction => {
      const txDate = new Date(transaction.createdAt);
      return txDate >= new Date(startDate) && txDate <= new Date(endDate);
    });
    
    expect(allInRange).toBe(true);
    
    reporter.endTest('passed');
  });
  
  // Test retrieving a specific transaction
  test('TC005_WalletTransaction_Specific_Retrieve_Success', async () => {
    reporter.startTest('Retrieve Specific Transaction', {
      description: 'Verify that a specific transaction can be retrieved by ID',
      severity: 'high',
      category: 'smoke'
    });
    
    // Get all transactions first
    reporter.addStep('Retrieve all transactions', 'passed');
    const transactions = await walletApi.getTransactions({}, walletId);
    
    // Skip test if no transactions are available
    if (!transactions.transactions.length) {
      reporter.addStep('No transactions available, skipping test', 'skipped');
      reporter.endTest('skipped');
      return;
    }
    
    // Get the first transaction ID
    const transactionId = transactions.transactions[0].transactionId;
    
    // Get the specific transaction
    reporter.addStep(`Retrieve transaction with ID ${transactionId}`, 'passed');
    const transaction = await walletApi.getTransaction(transactionId, walletId);
    
    // Verify transaction structure
    expect(transaction).toHaveProperty('transactionId');
    expect(transaction.transactionId).toBe(transactionId);
    expect(transaction).toHaveProperty('currency');
    expect(transaction).toHaveProperty('amount');
    expect(transaction).toHaveProperty('type');
    expect(transaction).toHaveProperty('status');
    expect(['pending', 'finished']).toContain(transaction.status);
    
    // If status is finished, should have outcome
    if (transaction.status === 'finished') {
      expect(transaction).toHaveProperty('outcome');
      expect(['approved', 'denied']).toContain(transaction.outcome);
    }
    
    // Log transaction details
    reporter.addAttachment('Transaction Details', transaction, 'json');
    
    reporter.endTest('passed');
  });
  
  // End test suite
  afterAll(() => {
    reporter.endSuite('Wallet Operations Tests');
  });
});