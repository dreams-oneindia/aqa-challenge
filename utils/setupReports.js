/**
 * Simple script to ensure report directories exist
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get reporting configuration
const reportType = process.env.REPORT_TYPE || 'console';
let outputDir = process.env.REPORT_OUTPUT_DIR || 
  (reportType === 'allure' ? './allure-results' : './reports');
outputDir = path.join(outputDir, 'attachments');
console.log(`Setting up ${reportType} reporter output directory...`);

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  try {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created report directory: ${outputDir}`);
  } catch (error) {
    console.error(`Failed to create report directory: ${error.message}`);
  }
} else {
  console.log(`Report directory already exists: ${outputDir}`);
  //clear the directory
  fs.readdirSync(outputDir).forEach(file => {
    const filePath = path.join(outputDir, file);
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  });
}

console.log('Report setup complete.');