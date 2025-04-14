/**
 * API endpoints for the Wallet API
 */
const endpoints = {
    // User endpoints
    user: {
      login: '/user/login',
      info: (userId) => `/user/info/${userId}`
    },
    
    // Wallet endpoints
    wallet: {
      getWallet: (walletId) => `/wallet/${walletId}`,
      transaction: (walletId) => `/wallet/${walletId}/transaction`,
      getTransaction: (walletId, transactionId) => `/wallet/${walletId}/transaction/${transactionId}`,
      getTransactions: (walletId) => `/wallet/${walletId}/transactions`
    }
  };
  
  module.exports = endpoints;