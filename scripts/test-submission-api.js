#!/usr/bin/env node

/**
 * Test the submission portal API endpoints
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const TEST_EMAIL = 'yash.mali@adypu.edu.in';
const TEST_CODE = 'NPYE-7TYZ-6FYG';

async function testSubmissionAPI() {
  console.log('\n🧪 Testing Submission Portal API\n');
  console.log('━'.repeat(60));
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test 1: Verify access code
    console.log('\n1️⃣  Testing access code verification...');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Code: ${TEST_CODE}`);
    
    const verifyResponse = await fetch(`${baseUrl}/api/final-submissions/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadEmail: TEST_EMAIL,
        accessCode: TEST_CODE,
      }),
    });
    
    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      throw new Error(`Access verification failed: ${error.error || verifyResponse.statusText}`);
    }
    
    const verifyData = await verifyResponse.json();
    console.log('   ✓ Access code verified!');
    console.log(`   Team: ${verifyData.teamName || 'N/A'}`);
    console.log(`   Hash: ${verifyData.accessCodeHash?.substring(0, 16)}...`);
    
    // Test 2: Submit project (dry run)
    console.log('\n2️⃣  Testing project submission...');
    
    const submissionData = {
      projectName: 'Test Project Alpha',
      leadEmail: TEST_EMAIL,
      accessCodeHash: verifyData.accessCodeHash,
      deckUrl: 'https://example.com/test-deck.pdf',
      repoUrl: 'https://github.com/test/alpha-project',
      demoUrl: 'https://test-demo.example.com',
      documentationUrl: 'https://test-docs.example.com',
      notes: 'This is a TEST submission from the API test script. Please ignore or delete.',
    };
    
    console.log('   Project:', submissionData.projectName);
    console.log('   Deck:', submissionData.deckUrl);
    console.log('   Repo:', submissionData.repoUrl);
    
    const submitResponse = await fetch(`${baseUrl}/api/final-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    });
    
    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(`Submission failed: ${error.error || submitResponse.statusText}`);
    }
    
    const submitData = await submitResponse.json();
    console.log('   ✓ Submission successful!');
    console.log('   Response:', JSON.stringify(submitData, null, 2));
    
    console.log('\n' + '━'.repeat(60));
    console.log('✅ All tests passed!\n');
    console.log('Next steps:');
    console.log('  1. Check admin portal at /admin');
    console.log('  2. Look for "Test Project Alpha" in final submissions');
    console.log('  3. Try the actual UI at /submit with the same credentials\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  - Make sure server is running (npm start)');
    console.error('  - Check SUBMISSION_CLOSED env variable');
    console.error('  - Verify access codes were generated');
    console.error('  - Check Firebase connection\n');
    process.exit(1);
  }
}

testSubmissionAPI();
