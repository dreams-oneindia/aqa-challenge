const { v4: uuidv4 } = require('uuid');

/**
 * Mock implementation of the Wallet API client
 * This is used for testing without a real backend
 */
class WalletApiMock {
  /**
   * Create a new WalletApiMock
   */
  constructor() {
    // Initialize mock data
    this.mockData = {
      userId: uuidv4(),
      walletId: uuidv4(),
      wallet: {
        walletId: null, // Set in init()
        currencyClips: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      transactions: []
    };
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize mock data
   */
  init() {
    // Set wallet ID
    this.mockData.wallet.walletId = this.mockData.walletId;
  }

  /**
   * Set the authorization token
   * @param {string} token - The authorization token
   */
  setToken(token) {
    this.token = token;
  }
  
  /**
   * Login to the API (mock)
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<object>} - Login response
   */
  async login(username, password) {
    // Add delay to simulate network
    await this._delay(200);
    
    // Generate tokens
    const token = `mock-token-${Date.now()}`;
    const refreshToken = `mock-refresh-${Date.now()}`;
    
    // Set mock token
    this.setToken(token);
    this.userId = this.mockData.userId;
    
    // Return mock response
    return {
      token,
      refreshToken,
      expiry: new Date(Date.now() + 3600 * 1000).toISOString(),
      userId: this.mockData.userId
    };
  }
  
  /**
   * Get user information (mock)
   * @param {string} userId - User ID
   * @returns {Promise<object>} - User information
   */
  async getUserInfo(userId = this.userId) {
    // Add delay to simulate network
    await this._delay(100);
    
    // Check if user ID matches
    if (userId !== this.mockData.userId) {
      throw new Error('User not found');
    }
    
    // Set wallet ID
    this.walletId = this.mockData.walletId;
    
    // Return mock response
    return {
      walletId: this.mockData.walletId,
      name: 'Test User',
      locale: 'en-US',
      region: 'US',
      timezone: 'America/New_York',
      email: 'test@example.com'
    };
  }
  
  /**
   * Get wallet information (mock)
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} - Wallet information
   */
  async getWallet(walletId = this.walletId) {
    // Add delay to simulate network
    await this._delay(100);
    
    // Check if wallet ID matches
    if (walletId !== this.mockData.walletId) {
      throw new Error('Wallet not found');
    }
    
    // Return mock wallet (make a deep copy to avoid circular references)
    return JSON.parse(JSON.stringify(this.mockData.wallet));
  }
  
  /**
   * Create a transaction (mock)
   * @param {object} transactionData - Transaction data
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} - Transaction response
   */
  async createTransaction(transactionData, walletId = this.walletId) {
    // Add delay to simulate network
    await this._delay(500);
    
    // Check if wallet ID matches
    if (walletId !== this.mockData.walletId) {
      throw new Error('Wallet not found');
    }
    
    // Validate transaction data
    try {
      this._validateTransaction(transactionData);
    } catch (error) {
      // Return error with appropriate structure
      return Promise.reject(error);
    }
    
    // Create transaction
    const transactionId = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Determine if transaction should be pending
    // Simulate pending for large amounts or specified timeout
    const isPending = 
      transactionData.amount > 10000 || 
      transactionData.simulateTimeout === true;
    
    // Create transaction object
    const transaction = {
      transactionId,
      currency: transactionData.currency,
      amount: transactionData.amount,
      type: transactionData.type,
      status: isPending ? 'pending' : 'finished',
      outcome: isPending ? null : this._determineOutcome(transactionData),
      createdAt,
      updatedAt: createdAt
    };
    
    // Make a clean copy without any circular references
    const cleanTransaction = JSON.parse(JSON.stringify(transaction));
    
    // Add to transactions list
    this.mockData.transactions.push(cleanTransaction);
    
    // If approved, update wallet
    if (transaction.status === 'finished' && transaction.outcome === 'approved') {
      this._updateWalletBalance(cleanTransaction);
    }
    
    // For pending transactions, return minimal info
    if (isPending) {
      return {
        transactionId,
        status: 'pending',
        createdAt
      };
    }
    
    // Return transaction
    return { ...cleanTransaction };
  }
  
  /**
   * Get details of a specific transaction (mock)
   * @param {string} transactionId - Transaction ID
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} - Transaction details
   */
  async getTransaction(transactionId, walletId = this.walletId) {
    // Add delay to simulate network
    await this._delay(100);
    
    // Check if wallet ID matches
    if (walletId !== this.mockData.walletId) {
      throw new Error('Wallet not found');
    }
    
    // Find transaction
    const transaction = this.mockData.transactions.find(t => t.transactionId === transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    // Simulate transaction completion after a delay
    // This simulates the external service responding
    if (transaction.status === 'pending' && !transaction.isProcessing) {
      transaction.isProcessing = true;
      
      // Simulate external service response
      setTimeout(() => {
        // Update transaction status
        transaction.status = 'finished';
        transaction.outcome = this._determineOutcome(transaction);
        transaction.updatedAt = new Date().toISOString();
        
        // If approved, update wallet
        if (transaction.outcome === 'approved') {
          this._updateWalletBalance(transaction);
        }
        
        console.log(`Mock: Transaction ${transactionId} completed with outcome: ${transaction.outcome}`);
      }, 2000); // 2 second delay
    }
    
    // Return a clean copy of the transaction
    return JSON.parse(JSON.stringify(transaction));
  }
  
  /**
   * Get all transactions for a wallet (mock)
   * @param {object} params - Query parameters (page, startDate, endDate)
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} - Transactions list
   */
  async getTransactions(params = {}, walletId = this.walletId) {
    // Add delay to simulate network
    await this._delay(200);
    
    // Check if wallet ID matches
    if (walletId !== this.mockData.walletId) {
      throw new Error('Wallet not found');
    }
    
    // Process parameters
    const { page = 1, startDate, endDate } = params;
    const pageSize = 10;
    
    // Filter transactions
    let filteredTransactions = [...this.mockData.transactions];
    
    if (startDate) {
      const start = new Date(startDate);
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.createdAt) >= start
      );
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.createdAt) <= end
      );
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Paginate
    const totalCount = filteredTransactions.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    // Return paginated results (clean copy)
    return JSON.parse(JSON.stringify({
      transactions: paginatedTransactions,
      totalCount,
      currentPage: page,
      totalPages
    }));
  }
  
  /**
   * Validate transaction data
   * @private
   * @param {object} transactionData - Transaction data
   */
  _validateTransaction(transactionData) {
    // Check required fields
    if (!transactionData.currency) {
      throw this._createError('Currency is required', 400);
    }
    
    if (transactionData.amount === undefined) {
      throw this._createError('Amount is required', 400);
    }
    
    if (!transactionData.type) {
      throw this._createError('Transaction type is required', 400);
    }
    
    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];
    if (!validCurrencies.includes(transactionData.currency)) {
      throw this._createError('Invalid currency', 400);
    }
    
    // Validate amount
    if (typeof transactionData.amount !== 'number' || isNaN(transactionData.amount)) {
      throw this._createError('Amount must be a number', 400);
    }
    
    if (transactionData.amount <= 0) {
      throw this._createError('Invalid amount', 400);
    }
    
    // Validate type
    if (!['credit', 'debit'].includes(transactionData.type)) {
      throw this._createError('Transaction type must be credit or debit', 400);
    }
    
    // For debit transactions, check if there are sufficient funds
    if (transactionData.type === 'debit') {
      const currencyClip = this.mockData.wallet.currencyClips.find(
        clip => clip.currency === transactionData.currency
      );
      
      if (!currencyClip || currencyClip.balance < transactionData.amount) {
        // Don't throw an error, but flag for denial
        transactionData._insufficientFunds = true;
      }
    }
  }
  
  /**
   * Determine transaction outcome
   * @private
   * @param {object} transactionData - Transaction data
   * @returns {string} - Transaction outcome (approved or denied)
   */
  _determineOutcome(transactionData) {
    // Deny if insufficient funds for debit
    if (transactionData._insufficientFunds || 
        (transactionData.type === 'debit' && transactionData.amount > 5000)) {
      return 'denied';
    }
    
    // Approve most transactions
    return 'approved';
  }
  
  /**
   * Update wallet balance based on transaction
   * @private
   * @param {object} transaction - Transaction data
   */
  _updateWalletBalance(transaction) {
    // Find currency clip
    let currencyClip = this.mockData.wallet.currencyClips.find(
      clip => clip.currency === transaction.currency
    );
    
    // If clip doesn't exist, create it
    if (!currencyClip) {
      currencyClip = {
        currency: transaction.currency,
        balance: 0,
        lastTransaction: null,
        transactionCount: 0
      };
      this.mockData.wallet.currencyClips.push(currencyClip);
    }
    
    // Update balance
    if (transaction.type === 'credit') {
      currencyClip.balance += transaction.amount;
    } else if (transaction.type === 'debit') {
      currencyClip.balance -= transaction.amount;
    }
    
    // Update clip info
    currencyClip.lastTransaction = transaction.createdAt;
    currencyClip.transactionCount += 1;
    
    // Update wallet timestamp
    this.mockData.wallet.updatedAt = new Date().toISOString();
  }
  
  /**
   * Create an error response
   * @private
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @returns {Error} - Error object with response
   */
  _createError(message, status) {
    const error = new Error(message);
    error.response = {
      status,
      data: {
        error: message
      }
    };
    return error;
  }
  
  /**
   * Delay execution to simulate network latency
   * @private
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = WalletApiMock;