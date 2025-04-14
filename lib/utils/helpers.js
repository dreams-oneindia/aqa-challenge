const { v4: uuidv4 } = require('uuid');

/**
 * Utility helper functions for the test suite
 */

/**
 * Generate a random UUID
 * @returns {string} - Random UUID
 */
const generateUUID = () => uuidv4();

/**
 * Wait for a specified duration
 * @param {number} ms - Duration to wait in milliseconds
 * @returns {Promise<void>} - Promise that resolves after the wait
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a random amount within a range
 * @param {number} min - Minimum amount
 * @param {number} max - Maximum amount
 * @param {number} decimals - Number of decimal places
 * @returns {number} - Random amount
 */
const generateRandomAmount = (min = 1, max = 1000, decimals = 2) => {
  const rand = Math.random() * (max - min) + min;
  return parseFloat(rand.toFixed(decimals));
};

/**
 * Generate a random currency code
 * @returns {string} - Random currency code
 */
const generateRandomCurrency = () => {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];
  return currencies[Math.floor(Math.random() * currencies.length)];
};

/**
 * Format date to ISO string with timezone
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (date = new Date()) => {
  return date.toISOString();
};

/**
 * Get a date that is offset from now
 * @param {number} days - Days to offset (negative for past, positive for future)
 * @returns {Date} - Date object
 */
const getOffsetDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Get a formatted date range
 * @param {number} startDaysOffset - Start date offset in days
 * @param {number} endDaysOffset - End date offset in days
 * @returns {object} - Object with startDate and endDate
 */
const getDateRange = (startDaysOffset, endDaysOffset) => {
  return {
    startDate: formatDate(getOffsetDate(startDaysOffset)),
    endDate: formatDate(getOffsetDate(endDaysOffset))
  };
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} - Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if two objects are equal
 * @param {object} obj1 - First object
 * @param {object} obj2 - Second object
 * @returns {boolean} - Whether the objects are equal
 */
const areObjectsEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Generate a simple random string
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = {
  generateUUID,
  wait,
  generateRandomAmount,
  generateRandomCurrency,
  formatDate,
  getOffsetDate,
  getDateRange,
  deepClone,
  areObjectsEqual,
  generateRandomString
};