const axios = require('axios');
const { getConfig } = require('../../config/testConfig');

/**
 * Base API client for making HTTP requests
 */
class ApiClient {
  /**
   * Create a new API client
   * @param {string} baseUrl - Base URL for API requests
   * @param {object} defaultHeaders - Default headers to include in all requests
   */
  constructor(baseUrl, defaultHeaders = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
    this.token = null;
    
    // Create axios instance
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: getConfig().environment.timeouts.request,
      headers: {
        'Content-Type': 'application/json',
        ...defaultHeaders
      }
    });
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(this._handleSuccess, this._handleError);
  }
  
  /**
   * Set the authorization token
   * @param {string} token - The authorization token
   */
  setToken(token) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   * @param {object} headers - Additional headers
   * @returns {Promise<object>} - API response
   */
  async get(endpoint, params = {}, headers = {}) {
    return this.client.get(endpoint, { params, headers });
  }
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} headers - Additional headers
   * @returns {Promise<object>} - API response
   */
  async post(endpoint, data = {}, headers = {}) {
    return this.client.post(endpoint, data, { headers });
  }
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} headers - Additional headers
   * @returns {Promise<object>} - API response
   */
  async put(endpoint, data = {}, headers = {}) {
    return this.client.put(endpoint, data, { headers });
  }
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} headers - Additional headers
   * @returns {Promise<object>} - API response
   */
  async delete(endpoint, headers = {}) {
    return this.client.delete(endpoint, { headers });
  }
  
  /**
   * Handle successful response
   * @private
   * @param {object} response - Axios response
   * @returns {object} - Response data
   */
  _handleSuccess(response) {
    console.log(`Request succeeded: ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  }
  
  /**
   * Handle error response
   * @private
   * @param {object} error - Axios error
   * @returns {Promise<object>} - Rejected promise with error
   */
  _handleError(error) {
    if (error.response) {
      console.error(`Request failed: ${error.config.method.toUpperCase()} ${error.config.url}`);
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('Request made but no response received');
      console.error(error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
}

module.exports = ApiClient;