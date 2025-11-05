#!/usr/bin/env node

/**
 * Send submission access codes to registered teams
 * 
 * This script:
 * 1. Loads plain access codes from data/submission-codes-plain.json
 * 2. Fetches team registration details
 * 3. Sends personalized emails with access codes to each team
 * 
 * Usage:
 *   node scripts/send-submission-codes.js
 *   node scripts/send-submission-codes.js --test test@example.com
 *   node scripts/send-submission-codes.js --team-email lead@example.com
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { sendSubmissionAccessCode } = require('../server/services/email');
const { findTeamRegistrationByLeadEmail } = require('../server/services/teamRegistrations');
const { initAdmin, adminAvailable } = require('../server/firebaseAdmin');

const PLAIN_CODES_FILE = path.join(process.cwd(), 'data', 'submission-codes-plain.json');
const DELAY_BETWEEN_EMAILS = 1000; // 1 second between emails

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load plain codes
const loadPlainCodes = () => {
  if (!fs.existsSync(PLAIN_CODES_FILE)) {
    throw new Error(`Plain codes file not found: ${PLAIN_CODES_FILE}\nRun: node scripts/generate-submission-codes.js first`);
  }
  try {
    const raw = fs.readFileSync(PLAIN_CODES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to load plain codes: ${error.message}`);
  }
};

async function sendSubmissionCodes() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const testEmail = isTest ? args[args.indexOf('--test') + 1] : null;
  const singleTeam = args.includes('--team-email') ? args[args.indexOf('--team-email') + 1] : null;
  const forceConfirm = args.includes('--confirm');
  
  console.log('📧 CoNSTruct Submission Code Mailer\n');
  console.log('━'.repeat(60));
  
  // SAFETY CHECK: Require explicit confirmation
  if (!forceConfirm && !isTest) {
    console.log('\n⚠️  SAFETY CHECK: Email sending requires explicit confirmation\n');
    console.log('This will send ACCESS CODES to teams. Please ensure:');
    console.log('  ✓ You have permission to send these emails');
    console.log('  ✓ Codes have been reviewed in data/submission-codes-plain.json');
    console.log('  ✓ SMTP is properly configured');
    console.log('  ✓ Teams are ready to receive codes\n');
    console.log('To proceed, run with --confirm flag:');
    if (singleTeam) {
      console.log(`  node scripts/send-submission-codes.js --team-email ${singleTeam} --confirm\n`);
    } else {
      console.log('  node scripts/send-submission-codes.js --confirm\n');
    }
    console.log('Or test first with:');
    console.log('  node scripts/send-submission-codes.js --test your-email@example.com\n');
    process.exit(0);
  }
  
  try {
    // Check SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD in .env');
    }
    console.log('✓ SMTP configured');
    
    // Initialize Firebase
    initAdmin();
    if (!adminAvailable()) {
      throw new Error('Firebase Admin SDK not available');
    }
    console.log('✓ Firebase initialized');
    
    // Load codes
    console.log('📥 Loading submission codes...');
    const plainCodes = loadPlainCodes();
    const codeEntries = Object.entries(plainCodes);
    
    if (codeEntries.length === 0) {
      console.log('⚠️  No codes found. Run generate-submission-codes.js first.');
      process.exit(0);
    }
    
    console.log(`✓ Loaded ${codeEntries.length} codes\n`);
    
    // Filter for single team if specified
    let teamsToEmail = codeEntries;
    if (singleTeam) {
      const normalized = normalizeEmail(singleTeam);
      teamsToEmail = codeEntries.filter(([email]) => normalizeEmail(email) === normalized);
      
      if (teamsToEmail.length === 0) {
        throw new Error(`No code found for: ${singleTeam}`);
      }
      console.log(`📌 Sending to single team: ${singleTeam}\n`);
    }
    
    let successCount = 0;
    let failCount = 0;
    const failed = [];
    
    console.log('📤 Sending emails...\n');
    
    for (const [leadEmail, codeData] of teamsToEmail) {
      const normalized = normalizeEmail(leadEmail);
      
      try {
        // Fetch full registration
        const registration = await findTeamRegistrationByLeadEmail(normalized);
        
        if (!registration) {
          console.log(`  ⚠️  Skipping ${codeData.teamName} - registration not found`);
          failCount++;
          failed.push({ leadEmail, reason: 'Registration not found' });
          continue;
        }
        
        // Prepare email data
        const emailData = {
          teamName: codeData.teamName,
          leadName: codeData.leadName || registration.lead?.name,
          leadEmail: normalized,
          accessCode: codeData.code,
          submissionUrl: process.env.SUBMISSION_URL || 'https://submit.nstconstruct.xyz',
          supportEmail: process.env.VITE_SUBMIT_SUPPORT_EMAIL || 'saurabhkumar@newtonschool.co',
          deadline: process.env.VITE_SUBMIT_DEADLINE || 'December 5, 2025',
          memberEmails: registration.emails || [],
        };
        
        // Use test email if in test mode
        if (isTest && testEmail) {
          console.log(`  🧪 TEST MODE: Sending to ${testEmail} instead of ${normalized}`);
          emailData.leadEmail = testEmail;
          emailData.memberEmails = [testEmail];
        }
        
        // Send the email
        await sendSubmissionAccessCode(emailData);
        
        successCount++;
        console.log(`  ✓ ${codeData.teamName} (${normalized}) - Code: ${codeData.code}`);
        
        // Rate limiting
        if (teamsToEmail.length > 1) {
          await wait(DELAY_BETWEEN_EMAILS);
        }
        
      } catch (error) {
        failCount++;
        failed.push({ leadEmail, reason: error.message });
        console.log(`  ❌ ${codeData.teamName} (${normalized}) - Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '━'.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Successfully sent: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed emails:');
      failed.forEach(({ leadEmail, reason }) => {
        console.log(`   - ${leadEmail}: ${reason}`);
      });
    }
    
    if (isTest) {
      console.log('\n🧪 TEST MODE - No real emails sent to teams.');
      console.log('   Email was sent to: ' + testEmail);
    } else {
      console.log('\n✅ LIVE MODE - Real emails sent to teams!');
      console.log('   Teams can now use their codes to submit.');
    }
    
    console.log('\n✅ Done!\n');
    process.exit(failCount > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the mailer
sendSubmissionCodes();
