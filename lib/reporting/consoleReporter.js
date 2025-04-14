const Reporter = require('./reporter');

/**
 * Console reporter implementation
 * Focused purely on beautiful console output
 */
class ConsoleReporter extends Reporter {
  /**
   * Constructor for the Console reporter
   */
  constructor() {
    super();
    this.currentTest = null;
    this.currentSuite = null;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.totalTests = 0;
    this.startTime = null;
  }
  
  /**
   * Start a test suite
   * @param {string} suiteName - Name of the test suite
   */
  startSuite(suiteName) {
    this.currentSuite = suiteName;
    this.startTime = Date.now();
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.totalTests = 0;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`\x1b[1;36m STARTING TEST SUITE: ${suiteName} \x1b[0m`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Started at: ${new Date().toISOString()}`);
  }
  
  /**
   * End a test suite
   * @param {string} suiteName - Name of the test suite
   */
  endSuite(suiteName) {
    const duration = (Date.now() - this.startTime) / 1000;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`\x1b[1;36m TEST SUITE COMPLETED: ${suiteName} \x1b[0m`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`\x1b[32mPassed: ${this.passedTests}\x1b[0m`);
    console.log(`\x1b[31mFailed: ${this.failedTests}\x1b[0m`);
    console.log(`\x1b[33mSkipped: ${this.skippedTests}\x1b[0m`);
    console.log(`${'='.repeat(80)}\n`);
    
    this.currentSuite = null;
  }
  
  /**
   * Start a test case
   * @param {string} testName - Name of the test case
   * @param {object} metadata - Additional metadata for the test case
   */
  startTest(testName, metadata = {}) {
    this.currentTest = {
      name: testName,
      startTime: Date.now(),
      steps: []
    };
    this.totalTests++;
    
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`\x1b[1m TEST: ${testName} \x1b[0m`);
    
    if (metadata.description) {
      console.log(`Description: ${metadata.description}`);
    }
    
    if (metadata.severity) {
      console.log(`Severity: ${metadata.severity}`);
    }
    
    if (metadata.category) {
      console.log(`Category: ${metadata.category}`);
    }
    
    console.log(`${'-'.repeat(80)}`);
  }
  
  /**
   * End a test case
   * @param {string} status - Test status (passed, failed, skipped)
   * @param {object} metadata - Additional metadata for the test case
   */
  endTest(status, metadata = {}) {
    if (!this.currentTest) {
      console.warn('No current test to end');
      return;
    }
    
    const duration = (Date.now() - this.currentTest.startTime) / 1000;
    
    // Update test counts
    if (status === 'passed') this.passedTests++;
    else if (status === 'failed') this.failedTests++;
    else if (status === 'skipped') this.skippedTests++;
    
    // Format status for display
    let statusDisplay;
    switch (status) {
      case 'passed':
        statusDisplay = '\x1b[42m\x1b[30m PASSED \x1b[0m'; // Green background
        break;
      case 'failed':
        statusDisplay = '\x1b[41m\x1b[37m FAILED \x1b[0m'; // Red background
        break;
      case 'skipped':
        statusDisplay = '\x1b[43m\x1b[30m SKIPPED \x1b[0m'; // Yellow background
        break;
      default:
        statusDisplay = status.toUpperCase();
    }
    
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`Test completed: ${this.currentTest.name}`);
    console.log(`Status: ${statusDisplay}`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    
    // Print error if present
    if (metadata.error) {
      console.log(`\n\x1b[31mError: ${metadata.error.message || String(metadata.error)}\x1b[0m`);
      if (metadata.error.stack) {
        console.log(`\x1b[31mStack: ${metadata.error.stack.split('\n')[0]}\x1b[0m`);
      }
    }
    
    console.log(`${'-'.repeat(80)}\n`);
    
    this.currentTest = null;
  }
  
  /**
   * Add an attachment to the report
   * @param {string} name - Name of the attachment
   * @param {any} content - Content of the attachment
   * @param {string} type - MIME type of the attachment
   */
  addAttachment(name, content, type) {
    console.log(`    \x1b[36m[Attachment]\x1b[0m ${name} (${type})`);
    
    // For JSON attachments, log a brief preview
    if (type === 'json' && content) {
      try {
        const safeContent = typeof content === 'object' 
          ? JSON.stringify(content, null, 2) 
          : String(content);
        
        // Only log a short preview
        const preview = safeContent.length > 150 
          ? safeContent.substring(0, 147) + '...' 
          : safeContent;
        
        console.log(`      Preview: ${preview}`);
      } catch (error) {
        console.log(`      Error previewing content: ${error.message}`);
      }
    }
  }
  
  /**
   * Log a message to the report
   * @param {string} message - Message to log
   * @param {string} level - Log level (info, warning, error)
   */
  log(message, level = 'info') {
    // Format level for display
    let levelDisplay;
    switch (level.toLowerCase()) {
      case 'info':
        levelDisplay = '\x1b[36mINFO\x1b[0m'; // Cyan
        break;
      case 'warning':
        levelDisplay = '\x1b[33mWARN\x1b[0m'; // Yellow
        break;
      case 'error':
        levelDisplay = '\x1b[31mERROR\x1b[0m'; // Red
        break;
      default:
        levelDisplay = level.toUpperCase();
    }
    
    console.log(`    [${levelDisplay}] ${message}`);
  }
  
  /**
   * Add a step to the report
   * @param {string} name - Name of the step
   * @param {string} status - Step status (passed, failed, skipped)
   * @param {object} metadata - Additional metadata for the step
   */
  addStep(name, status = 'passed', metadata = {}) {
    if (this.currentTest) {
      this.currentTest.steps.push({ name, status });
    }
    
    // Format status for display
    let statusIcon;
    switch (status) {
      case 'passed':
        statusIcon = '\x1b[32m✓\x1b[0m'; // Green checkmark
        break;
      case 'failed':
        statusIcon = '\x1b[31m✗\x1b[0m'; // Red x
        break;
      case 'skipped':
        statusIcon = '\x1b[33m⚠\x1b[0m'; // Yellow warning
        break;
      default:
        statusIcon = '-';
    }
    
    console.log(`    ${statusIcon} ${name}`);
    
    if (metadata.error) {
      console.error(`      \x1b[31mError: ${metadata.error.message || String(metadata.error)}\x1b[0m`);
      // If stack trace is available, log the first line
      if (metadata.error.stack) {
        const stackLine = metadata.error.stack.split('\n')[0];
        console.error(`      \x1b[31mStack: ${stackLine}\x1b[0m`);
      }
    }
  }
}

module.exports = { ConsoleReporter };