#!/usr/bin/env node

/**
 * Send a single test email to preview the submission code template
 * 
 * Usage: node scripts/send-test-submission-email.js your-email@example.com
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { sendSubmissionAccessCode } = require('../server/services/email');

const testEmail = process.argv[2];

if (!testEmail) {
  console.log('\nUsage: node scripts/send-test-submission-email.js your-email@example.com\n');
  process.exit(1);
}

console.log('\n📧 Sending test submission code email...\n');
console.log('━'.repeat(60));

const testData = {
  teamName: 'Team Mayday',
  leadName: 'Geetansh Goyal',
  leadEmail: testEmail,
  accessCode: 'A3F7-KR2M-9PQ4',
  submissionUrl: process.env.SUBMISSION_URL || 'https://submit.nstconstruct.xyz',
  supportEmail: process.env.VITE_SUBMIT_SUPPORT_EMAIL || 'noreply@nstconstruct.xyz',
  deadline: process.env.VITE_SUBMIT_DEADLINE || 'December 5, 2025',
  memberEmails: [],
};

sendSubmissionAccessCode(testData)
  .then(() => {
    console.log('✅ Test email sent successfully!\n');
    console.log('Check your inbox at:', testEmail);
    console.log('\nEmail details:');
    console.log('  Subject: 🔐 Your CoNSTruct Submission Code — Team Mayday');
    console.log('  Sample Code: A3F7-KR2M-9PQ4');
    console.log('  Submission URL:', testData.submissionUrl);
    console.log('\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to send test email:', error.message);
    console.error('\nPlease check:');
    console.error('  - SMTP credentials in .env file');
    console.error('  - SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD are set');
    console.error('  - Internet connection');
    console.error('\n');
    process.exit(1);
  });
