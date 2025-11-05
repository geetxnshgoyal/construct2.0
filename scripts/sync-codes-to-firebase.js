#!/usr/bin/env node

/**
 * Sync submission access codes from local JSON to Firebase
 * 
 * Usage:
 *   node scripts/sync-codes-to-firebase.js
 *   node scripts/sync-codes-to-firebase.js --confirm
 * 
 * This script:
 * 1. Reads hashed codes from data/submission-access.json
 * 2. Uploads them to Firebase Firestore (submissionAccessKeys collection)
 * 3. Updates existing entries or creates new ones
 */

const fs = require('fs');
const path = require('path');
const { adminAvailable, getDb } = require('../server/firebaseAdmin');

const SUBMISSION_ACCESS_FILE = path.join(process.cwd(), 'data', 'submission-access.json');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

async function syncCodesToFirebase(confirm = false) {
  console.log('\n🔄 Syncing submission access codes to Firebase...\n');

  // Check if Firebase is available
  if (!adminAvailable()) {
    console.error('❌ Firebase Admin SDK not initialized.');
    console.error('   Make sure FIREBASE_PROJECT_ID and credentials are set in .env');
    process.exit(1);
  }

  // Load local codes
  if (!fs.existsSync(SUBMISSION_ACCESS_FILE)) {
    console.error(`❌ File not found: ${SUBMISSION_ACCESS_FILE}`);
    console.error('   Run: node scripts/generate-submission-codes.js first');
    process.exit(1);
  }

  let entries;
  try {
    const raw = fs.readFileSync(SUBMISSION_ACCESS_FILE, 'utf8');
    entries = JSON.parse(raw);
  } catch (error) {
    console.error('❌ Failed to parse JSON file:', error.message);
    process.exit(1);
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    console.error('❌ No entries found in the file');
    process.exit(1);
  }

  console.log(`📊 Found ${entries.length} access code entries\n`);

  // Show sample
  console.log('Sample entries:');
  entries.slice(0, 3).forEach((entry, i) => {
    console.log(`  ${i + 1}. ${entry.teamName || 'N/A'} (${entry.leadEmail})`);
  });
  console.log('  ...\n');

  if (!confirm) {
    console.log('⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Run with --confirm flag to actually sync to Firebase:\n');
    console.log('   node scripts/sync-codes-to-firebase.js --confirm\n');
    return;
  }

  console.log('🚀 Starting sync to Firebase...\n');

  const db = getDb();
  const collection = db.collection('submissionAccessKeys');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const entry of entries) {
    const email = normalizeEmail(entry.leadEmail);
    
    if (!email) {
      console.warn(`⚠️  Skipping entry with missing email`);
      errorCount++;
      continue;
    }

    try {
      const docData = {
        leadEmail: email,
        accessCodeHash: entry.accessCodeHash || '',
        teamName: entry.teamName || null,
        campus: entry.campus || null,
        batch: entry.batch || null,
        generatedAt: entry.generatedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await collection.doc(email).set(docData, { merge: true });
      
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`  ✓ Synced ${successCount}/${entries.length} entries...`);
      }
    } catch (error) {
      errorCount++;
      errors.push({ email, error: error.message });
      console.error(`  ✗ Failed to sync ${email}:`, error.message);
    }
  }

  console.log('\n📈 Sync Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ email, error }) => {
      console.log(`  - ${email}: ${error}`);
    });
  }

  console.log('\n✨ Sync complete!\n');
}

// Main execution
const args = process.argv.slice(2);
const confirm = args.includes('--confirm');

syncCodesToFirebase(confirm)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
