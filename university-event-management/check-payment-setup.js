#!/usr/bin/env node

/**
 * Payment Setup Diagnostic Tool
 * Run this to check if payment system is configured correctly
 * 
 * Usage: node check-payment-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Payment System Diagnostic Tool\n');
console.log('='.repeat(50));

let hasErrors = false;
let hasWarnings = false;

// Check 1: Backend dependencies
console.log('\n📦 Checking Backend Dependencies...');
try {
  const backendPackage = require('./backend/package.json');
  if (backendPackage.dependencies.stripe) {
    console.log('✅ Stripe package installed in backend');
  } else {
    console.log('❌ Stripe package NOT found in backend');
    console.log('   Run: cd backend && npm install stripe');
    hasErrors = true;
  }
} catch (error) {
  console.log('❌ Could not read backend/package.json');
  hasErrors = true;
}

// Check 2: Frontend dependencies
console.log('\n📦 Checking Frontend Dependencies...');
try {
  const frontendPackage = require('./frontend/package.json');
  if (frontendPackage.dependencies['@stripe/stripe-js']) {
    console.log('✅ @stripe/stripe-js installed in frontend');
  } else {
    console.log('❌ @stripe/stripe-js NOT found in frontend');
    console.log('   Run: cd frontend && npm install @stripe/stripe-js @stripe/react-stripe-js');
    hasErrors = true;
  }
  if (frontendPackage.dependencies['@stripe/react-stripe-js']) {
    console.log('✅ @stripe/react-stripe-js installed in frontend');
  } else {
    console.log('❌ @stripe/react-stripe-js NOT found in frontend');
    hasErrors = true;
  }
} catch (error) {
  console.log('❌ Could not read frontend/package.json');
  hasErrors = true;
}

// Check 3: Backend files
console.log('\n📁 Checking Backend Files...');
const backendFiles = [
  'backend/controllers/paymentController.js',
  'backend/routes/payments.js',
  'backend/services/emailService.js',
];

backendFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} NOT found`);
    hasErrors = true;
  }
});

// Check 4: Frontend files
console.log('\n📁 Checking Frontend Files...');
const frontendFiles = [
  'frontend/src/services/payment.js',
  'frontend/src/pages/PaymentSuccess.js',
  'frontend/src/components/vendor/PaymentButton.js',
];

frontendFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} NOT found`);
    hasErrors = true;
  }
});

// Check 5: Environment variables (can't read .env directly, just check if file exists)
console.log('\n🔐 Checking Environment Files...');
if (fs.existsSync(path.join(__dirname, 'backend/.env'))) {
  console.log('✅ backend/.env exists');
  console.log('⚠️  Make sure it contains:');
  console.log('   - STRIPE_SECRET_KEY=sk_test_...');
  console.log('   - FRONTEND_URL=http://localhost:3000');
  hasWarnings = true;
} else {
  console.log('❌ backend/.env NOT found');
  console.log('   Create it and add your Stripe secret key');
  hasErrors = true;
}

if (fs.existsSync(path.join(__dirname, 'frontend/.env'))) {
  console.log('✅ frontend/.env exists');
  console.log('⚠️  Make sure it contains:');
  console.log('   - REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...');
  console.log('   - REACT_APP_API_URL=http://localhost:8080/api');
  hasWarnings = true;
} else {
  console.log('❌ frontend/.env NOT found');
  console.log('   Create it and add your Stripe publishable key');
  hasErrors = true;
}

// Check 6: Documentation
console.log('\n📚 Checking Documentation...');
const docs = [
  'STRIPE_PAYMENT_IMPLEMENTATION.md',
  'PAYMENT_SETUP_GUIDE.md',
  'TEST_PAYMENT_FLOW.md',
];

docs.forEach(doc => {
  if (fs.existsSync(path.join(__dirname, doc))) {
    console.log(`✅ ${doc}`);
  } else {
    console.log(`⚠️  ${doc} NOT found (optional)`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:\n');

if (!hasErrors && !hasWarnings) {
  console.log('🎉 All checks passed! Payment system is ready.');
  console.log('\n📝 Next steps:');
  console.log('1. Make sure backend and frontend servers are running');
  console.log('2. Follow TEST_PAYMENT_FLOW.md to test payments');
  console.log('3. Use test card: 4242 4242 4242 4242');
} else if (hasErrors) {
  console.log('❌ Some critical issues found. Please fix them before testing.');
  console.log('\n📝 Action items:');
  console.log('1. Install missing dependencies');
  console.log('2. Create missing files');
  console.log('3. Configure environment variables');
  console.log('4. Run this script again to verify');
} else if (hasWarnings) {
  console.log('⚠️  Setup looks good, but verify environment variables.');
  console.log('\n📝 Next steps:');
  console.log('1. Double-check .env files have correct Stripe keys');
  console.log('2. Restart backend server: cd backend && npm run dev');
  console.log('3. Start frontend: cd frontend && npm start');
  console.log('4. Follow TEST_PAYMENT_FLOW.md');
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 Need help? Check these files:');
console.log('   - PAYMENT_SETUP_GUIDE.md (setup instructions)');
console.log('   - TEST_PAYMENT_FLOW.md (testing guide)');
console.log('   - STRIPE_PAYMENT_IMPLEMENTATION.md (technical docs)');
console.log('\n');

process.exit(hasErrors ? 1 : 0);
