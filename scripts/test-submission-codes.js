#!/usr/bin/env node

/**
 * Test submission access code generation and validation
 * 
 * Usage: node scripts/test-submission-codes.js
 */

const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { initAdmin, adminAvailable } = require('../server/firebaseAdmin');
const { validateSubmissionAccess } = require('../server/services/submissionAccessRegistry');

const hashAccessCode = (code) => {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
};

const generateTestCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(12);
  let code = '';
  
  for (let i = 0; i < 12; i++) {
    code += characters[bytes[i] % characters.length];
  }
  
  return code.match(/.{1,4}/g).join('-');
};

async function runTests() {
  console.log('🧪 Testing Submission Access Code System\n');
  console.log('━'.repeat(60));
  
  try {
    // Test 1: Code generation
    console.log('\n1️⃣  Testing code generation...');
    const testCode = generateTestCode();
    console.log(`   Generated code: ${testCode}`);
    console.log(`   Format check: ${/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(testCode) ? '✓' : '✗'}`);
    console.log(`   Length check: ${testCode.length === 14 ? '✓' : '✗'}`);
    
    // Test 2: Hashing
    console.log('\n2️⃣  Testing hash generation...');
    const hash1 = hashAccessCode(testCode);
    const hash2 = hashAccessCode(testCode);
    console.log(`   Hash length: ${hash1.length} ${hash1.length === 64 ? '✓' : '✗'}`);
    console.log(`   Consistency: ${hash1 === hash2 ? '✓' : '✗'}`);
    console.log(`   Hash: ${hash1.substring(0, 32)}...`);
    
    // Test 3: Case insensitivity
    console.log('\n3️⃣  Testing case sensitivity...');
    const lowerHash = hashAccessCode(testCode.toLowerCase());
    const upperHash = hashAccessCode(testCode.toUpperCase());
    console.log(`   Same hash for different cases: ${lowerHash === upperHash ? '✗ (should be different)' : '✓'}`);
    
    // Test 4: Firebase initialization
    console.log('\n4️⃣  Testing Firebase Admin...');
    initAdmin();
    if (adminAvailable()) {
      console.log('   ✓ Firebase Admin SDK initialized');
    } else {
      console.log('   ⚠️  Firebase Admin SDK not available');
    }
    
    // Test 5: Validation with existing data
    console.log('\n5️⃣  Testing validation logic...');
    const testEmail = '2102508748@svyasa-sas.edu.in'; // From existing data
    const existingHash = 'c6b3491f15b3f66f30c82b87431e60114de8abe2e423cb5fdb5ae856b6f64279';
    
    console.log(`   Testing with: ${testEmail}`);
    
    // This should fail (wrong code)
    const wrongResult = await validateSubmissionAccess({
      leadEmail: testEmail,
      accessCode: 'WRONG-CODE-HERE',
    });
    console.log(`   Wrong code rejected: ${wrongResult.status === 401 ? '✓' : '✗'}`);
    
    // Test 6: Hash validation
    console.log('\n6️⃣  Testing hash-based validation...');
    const hashResult = await validateSubmissionAccess({
      leadEmail: testEmail,
      accessCodeHash: existingHash,
    });
    console.log(`   Valid hash accepted: ${hashResult.status === 200 ? '✓' : '✗'}`);
    if (hashResult.status === 200) {
      console.log(`   Team name: ${hashResult.data?.registration?.teamName || 'N/A'}`);
    }
    
    // Test 7: Email normalization
    console.log('\n7️⃣  Testing email normalization...');
    const upperEmail = testEmail.toUpperCase();
    const result1 = await validateSubmissionAccess({
      leadEmail: testEmail,
      accessCodeHash: existingHash,
    });
    const result2 = await validateSubmissionAccess({
      leadEmail: upperEmail,
      accessCodeHash: existingHash,
    });
    console.log(`   Case-insensitive email: ${result1.status === result2.status ? '✓' : '✗'}`);
    
    // Summary
    console.log('\n' + '━'.repeat(60));
    console.log('✅ All tests completed!\n');
    console.log('Next steps:');
    console.log('  1. Run: node scripts/generate-submission-codes.js');
    console.log('  2. Review: data/submission-codes-plain.json');
    console.log('  3. Test email: node scripts/send-submission-codes.js --test your@email.com');
    console.log('  4. Send to teams: node scripts/send-submission-codes.js\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
