#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔄 Running Merge Validation Test Suite...\n');

const testFiles = [
  'src/test/merge-validation/merge-compatibility-simple.test.ts',
  'src/test/merge-validation/database-compatibility.test.ts'
];

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m', 
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}\n`);
};

// Check if test files exist
logSection('Pre-flight Checks');

let allTestsExist = true;
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    log('green', `✓ ${file} exists`);
  } else {
    log('red', `✗ ${file} missing`);
    allTestsExist = false;
  }
});

if (!allTestsExist) {
  log('red', '\n❌ Some test files are missing. Please ensure all test files are created.');
  process.exit(1);
}

// Run tests
logSection('Running Test Suites');

const testResults = {};

try {
  // Run merge compatibility tests
  log('yellow', '🧪 Running Merge Compatibility Tests...');
  try {
    execSync('npm run test src/test/merge-validation/merge-compatibility-simple.test.ts', { 
      stdio: 'pipe',
      timeout: 30000
    });
    testResults.mergeCompatibility = 'PASS';
    log('green', '✓ Merge Compatibility Tests: PASSED');
  } catch (error) {
    testResults.mergeCompatibility = 'FAIL';
    log('red', '✗ Merge Compatibility Tests: FAILED');
    console.log(error.stdout?.toString() || error.message);
  }

  // Run database compatibility tests
  log('yellow', '🧪 Running Database Compatibility Tests...');
  try {
    execSync('npm run test src/test/merge-validation/database-compatibility.test.ts', {
      stdio: 'pipe',
      timeout: 30000
    });
    testResults.databaseCompatibility = 'PASS';
    log('green', '✓ Database Compatibility Tests: PASSED');
  } catch (error) {
    testResults.databaseCompatibility = 'FAIL';
    log('red', '✗ Database Compatibility Tests: FAILED');
    console.log(error.stdout?.toString() || error.message);
  }

} catch (error) {
  log('red', `❌ Error running tests: ${error.message}`);
  process.exit(1);
}

// Generate report
logSection('Test Results Summary');

const passedTests = Object.values(testResults).filter(result => result === 'PASS').length;
const totalTests = Object.keys(testResults).length;
const allPassed = passedTests === totalTests;

log('bold', `📊 Test Summary: ${passedTests}/${totalTests} test suites passed\n`);

Object.entries(testResults).forEach(([testName, result]) => {
  const displayName = testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  const icon = result === 'PASS' ? '✅' : '❌';
  const color = result === 'PASS' ? 'green' : 'red';
  log(color, `${icon} ${displayName}: ${result}`);
});

console.log('\n');

if (allPassed) {
  logSection('🎉 MERGE VALIDATION SUCCESSFUL');
  log('green', '✅ All tests passed! The merge should be safe to proceed.');
  log('green', '✅ Both branch functionalities are preserved.');
  log('green', '✅ No breaking changes detected.');
  
  console.log(`
${colors.green}${colors.bold}
┌─────────────────────────────────────────┐
│           MERGE VALIDATION              │
│              ✅ PASSED ✅               │
│                                         │
│  • Main branch functionality preserved │
│  • New features working correctly      │
│  • Database compatibility verified     │
│  • Component integration successful    │
└─────────────────────────────────────────┘
${colors.reset}`);

} else {
  logSection('⚠️  MERGE VALIDATION FAILED');
  log('red', '❌ Some tests failed. Please review the issues before merging.');
  log('yellow', '🔧 Fix the failing tests to ensure a safe merge.');
  
  console.log(`
${colors.red}${colors.bold}
┌─────────────────────────────────────────┐
│           MERGE VALIDATION              │
│              ❌ FAILED ❌               │
│                                         │
│  Please fix failing tests before       │
│  proceeding with the merge.             │
└─────────────────────────────────────────┘
${colors.reset}`);
  
  process.exit(1);
}

// Additional checks
logSection('Additional Recommendations');

log('blue', '📋 Pre-merge Checklist:');
console.log(`
  ${colors.green}✓${colors.reset} Run these tests: ${colors.yellow}npm run scripts/run-merge-tests.js${colors.reset}
  ${colors.green}✓${colors.reset} Build project: ${colors.yellow}npm run build${colors.reset}  
  ${colors.green}✓${colors.reset} Run existing tests: ${colors.yellow}npm run test${colors.reset}
  ${colors.green}✓${colors.reset} Check TypeScript: ${colors.yellow}npm run type-check${colors.reset}
  ${colors.green}✓${colors.reset} Test in staging environment
  ${colors.green}✓${colors.reset} Verify database migrations work
  ${colors.green}✓${colors.reset} Test user flows manually
`);

log('blue', '🚀 If all checks pass, the merge should be safe!');