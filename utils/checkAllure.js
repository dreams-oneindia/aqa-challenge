/**
 * Script to check if Allure is properly installed and configured
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking Allure installation and configuration...');

// Check if allure-results directory exists
const resultsDir = path.resolve('./allure-results');
if (!fs.existsSync(resultsDir)) {
  console.log('Creating allure-results directory...');
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Check if allure-commandline is installed
try {
  const allureVersion = execSync('npx allure --version').toString().trim();
  console.log(`Allure command-line version: ${allureVersion}`);
} catch (error) {
  console.error('Error checking Allure version:');
  console.error('Please make sure allure-commandline is installed.');
  console.error('You can install it with: npm install -g allure-commandline');
  process.exit(1);
}

// Create a simple history file to ensure proper Allure initialization
const categoriesFile = path.join(resultsDir, 'categories.json');
if (!fs.existsSync(categoriesFile)) {
  console.log('Creating initial categories configuration...');
  const categories = [
    {
      "name": "Failed tests",
      "matchedStatuses": ["failed"]
    },
    {
      "name": "Broken tests",
      "matchedStatuses": ["broken"]
    },
    {
      "name": "Ignored tests",
      "matchedStatuses": ["skipped"]
    },
    {
      "name": "Passed tests",
      "matchedStatuses": ["passed"]
    }
  ];
  
  fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
}

// Create environment properties file
const environmentFile = path.join(resultsDir, 'environment.properties');
if (!fs.existsSync(environmentFile)) {
  console.log('Creating environment properties file...');
  const env = `Environment=Test
API=Wallet API
Runner=Jest
Reporter=Allure
Date=${new Date().toISOString()}
`;
  fs.writeFileSync(environmentFile, env);
}

console.log('Allure check completed. Everything looks good!');
console.log('You can now run the tests with:');
console.log('  npm test');
console.log('And generate the report with:');
console.log('  npm run report');