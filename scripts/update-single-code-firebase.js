#!/usr/bin/env node

/**
 * Update a single team's access code in Firebase
 * 
 * Usage:
 *   node scripts/update-single-code-firebase.js student@university.edu XXXX-XXXX-XXXX
 *   node scripts/update-single-code-firebase.js student@university.edu --regenerate
 * 
 * This script:
 * 1. Takes an email and either a new code or --regenerate flag
 * 2. Hashes the code
 * 3. Updates both local JSON and Firebase
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { adminAvailable, getDb } = require('../server/firebaseAdmin');

const SUBMISSION_ACCESS_FILE = path.join(process.cwd(), 'data', 'submission-access.json');
const PLAIN_CODES_FILE = path.join(process.cwd(), 'data', 'submission-codes-plain.json');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const hashString = (value) => 
  crypto.createHash('sha256').update(String(value || '').trim()).digest('hex');

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars
  const segments = [];
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return segments.join('-');
};

async function updateSingleCode(email, code) {
  console.log('\n🔄 Updating access code...\n');

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }

  // Generate new code if requested
  const actualCode = code === '--regenerate' ? generateCode() : code;
  
  if (!actualCode || actualCode.length < 8) {
    console.error('❌ Invalid code format. Should be like: XXXX-XXXX-XXXX');
    process.exit(1);
  }

  const hashedCode = hashString(actualCode);

  console.log(`📧 Email: ${normalizedEmail}`);
  console.log(`🔑 New Code: ${actualCode}`);
  console.log(`🔒 Hash: ${hashedCode.substring(0, 16)}...`);
  console.log('');

  // Load existing entries
  let entries = [];
  let plainCodes = {};

  if (fs.existsSync(SUBMISSION_ACCESS_FILE)) {
    const raw = fs.readFileSync(SUBMISSION_ACCESS_FILE, 'utf8');
    entries = JSON.parse(raw);
  }

  if (fs.existsSync(PLAIN_CODES_FILE)) {
    const raw = fs.readFileSync(PLAIN_CODES_FILE, 'utf8');
    plainCodes = JSON.parse(raw);
  }

  // Find and update entry
  const entryIndex = entries.findIndex(
    (e) => normalizeEmail(e.leadEmail) === normalizedEmail
  );

  const newEntry = {
    leadEmail: normalizedEmail,
    accessCodeHash: hashedCode,
    teamName: entryIndex >= 0 ? entries[entryIndex].teamName : null,
    campus: entryIndex >= 0 ? entries[entryIndex].campus : null,
    batch: entryIndex >= 0 ? entries[entryIndex].batch : null,
    generatedAt: entryIndex >= 0 ? entries[entryIndex].generatedAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (entryIndex >= 0) {
    entries[entryIndex] = newEntry;
    console.log('✓ Updated existing entry in local JSON');
  } else {
    entries.push(newEntry);
    console.log('✓ Added new entry to local JSON');
  }

  // Update plain codes
  plainCodes[normalizedEmail] = {
    code: actualCode,
    teamName: newEntry.teamName,
    leadEmail: normalizedEmail,
    updatedAt: new Date().toISOString(),
  };

  // Save to files
  fs.writeFileSync(SUBMISSION_ACCESS_FILE, JSON.stringify(entries, null, 2));
  console.log(`✓ Saved to ${SUBMISSION_ACCESS_FILE}`);

  fs.writeFileSync(PLAIN_CODES_FILE, JSON.stringify(plainCodes, null, 2));
  console.log(`✓ Saved to ${PLAIN_CODES_FILE}`);

  // Update Firebase if available
  if (adminAvailable()) {
    try {
      const db = getDb();
      await db.collection('submissionAccessKeys').doc(normalizedEmail).set(newEntry, { merge: true });
      console.log('✓ Updated Firebase');
    } catch (error) {
      console.error('❌ Firebase update failed:', error.message);
    }
  } else {
    console.log('⚠️  Firebase not available - skipped cloud sync');
  }

  console.log('\n✨ Update complete!\n');
  console.log('📧 Next steps:');
  console.log(`   1. Send the new code to ${normalizedEmail}`);
  console.log(`   2. Code: ${actualCode}\n`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\nUsage:');
  console.log('  node scripts/update-single-code-firebase.js <email> <code>');
  console.log('  node scripts/update-single-code-firebase.js <email> --regenerate');
  console.log('\nExamples:');
  console.log('  node scripts/update-single-code-firebase.js student@uni.edu ABCD-1234-WXYZ');
  console.log('  node scripts/update-single-code-firebase.js student@uni.edu --regenerate\n');
  process.exit(1);
}

const [email, code] = args;

updateSingleCode(email, code)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
