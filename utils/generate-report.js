const { execSync } = require("child_process");
const dotenv = require("dotenv");
const path = require('path');
const fs = require('fs');

// Load environment variables from .env
dotenv.config();

// Get the output directory from the .env file
const outputDir = process.env.REPORT_OUTPUT_DIR || "allure-report";
console.log(`Output directory for the report: ${outputDir}`);
const resultDir = 'allure-results';
console.log(`Result directory for the report: ${resultDir}`);


// Ensure the result directory exists, create it if it doesn't
if (!fs.existsSync(resultDir)) {
  console.warn(`Result directory does not exist. Creating: ${resultDir}`);
  fs.mkdirSync(resultDir, { recursive: false });
}
// Generate and open the report
try {
  execSync(`allure generate allure-results && allure open ${outputDir}`, {
    stdio: "inherit",
  });
} catch (error) {
  console.error("Failed to generate the report:", error.message);
  process.exit(1);
}