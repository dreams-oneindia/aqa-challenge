const ApiClient = require('./apiClient');
const endpoints = require('./endpoints');
const { getConfig } = require('../../config/testConfig');

/**
 * Client for interacting with the Wallet API
 * Implements specific wallet-related API operations
 */
class WalletApi extends ApiClient {
  /**
   * Create a new WalletApi client
   */
  constructor() {
    const config = getConfig();
    const baseUrl = config.environment.baseUrl;
    const defaultHeaders = {
      'X-Service-Id': config.environment.serviceId
    };
    
    super(baseUrl, defaultHeaders);
    this.userId = null;
    this.walletId = null;
  }
  
  /**
   * Login to the API and store the authentication token
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<object>} - Login response
   */
  async login(username, password) {
    try {
      const response = await this.post(endpoints.user.login, { username, password });
      const { token, userId } = response.data;
      
      this.setToken(token);
      this.userId = userId;
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Get user information
   * @param {string} userId - User ID
   * @returns {Promise<object>} - User information
   */
  async getUserInfo(userId = this.userId) {
    if (!userId) {
      throw new Error('User ID not provided. Call login() first or provide a userId.');
    }
    
    try {
      const response = await this.get(endpoints.user.info(userId));
      // Store wallet ID from user info
      if (response.data && response.data.walletId) {
        this.walletId = response.data.walletId;
      }
      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error.message);
      throw error;
    }
  }
  
  /**
   * Get wallet information
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} - Wallet information
   */
  async getWallet(walletId = this.walletId) {
    if (!walletId) {
      throw new Error('Wallet ID not provided. Call getUserInfo() first or provide a walletId.');
    }
    
    try {
      const response = await this.get(endpoints.wallet.getWallet(walletId));
      return response.data;
    } catch (error) {
      console.error('Failed to get wallet:', error.message);
      throw error;
    }
  }
  
  /**
   * Create a transaction
   * @param {object} transactionData - Transaction data
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} - Transaction response
   */
  async createTransaction(transactionData, walletId = this.walletId) {
    if (!walletId) {
      throw new Error('Wallet ID not provided. Call getUserInfo() first or provide a walletId.');
    }
    
    try {
      const response = await this.post(endpoints.wallet.transaction(walletId), transactionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create transaction:', error.message);
      throw error;
    }
  }
  
  /**
   * Get details of a specific transaction
   * @param {string} transactionId - Transaction ID
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} - Transaction details
   */
  async getTransaction(transactionId, walletId = this.walletId) {
    if (!walletId) {
      throw new Error('Wallet ID not provided. Call getUserInfo() first or provide a walletId.');
    }
    
    try {
      const response = await this.get(endpoints.wallet.getTransaction(walletId, transactionId));
      return response.data;
    } catch (error) {
      console.error('Failed to get transaction:', error.message);
      throw error;
    }
  }
  
  /**
   * Get all transactions for a wallet
   * @param {object} params - Query parameters (page, startDate, endDate)
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} - Transactions list
   */
  async getTransactions(params = {}, walletId = this.walletId) {
    if (!walletId) {
      throw new Error('Wallet ID not provided. Call getUserInfo() first or provide a walletId.');
    }
    
    try {
      const response = await this.get(endpoints.wallet.getTransactions(walletId), params);
      return response.data;
    } catch (error) {
      console.error('Failed to get transactions:', error.message);
      throw error;
    }
  }
  
  /**
   * Wait for a transaction to complete
   * @param {string} transactionId - Transaction ID
   * @param {number} timeout - Timeout in milliseconds
   * @param {number} interval - Polling interval in milliseconds
   * @returns {Promise<object>} - Completed transaction
   */
  async waitForTransactionToComplete(transactionId, timeout = 30000, interval = 2000) {
    const startTime = Date.now();
    let transaction = null;
    
    while (Date.now() - startTime < timeout) {
      transaction = await this.getTransaction(transactionId);
      
      if (transaction.status === 'finished') {
        return transaction;
      }
      
      // Wait for the specified interval before polling again
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Transaction ${transactionId} did not complete within the timeout period.`);
  }
}

module.exports = WalletApi;