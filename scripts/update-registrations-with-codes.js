#!/usr/bin/env node

/**
 * Update Firebase registrations with submission access code hashes
 * 
 * This script adds the `submissionAccessCodeHash` field directly to each
 * team registration document in Firebase. This eliminates the need for a
 * separate collection and simplifies the verification process.
 * 
 * Usage:
 *   node scripts/update-registrations-with-codes.js [--confirm]
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { initAdmin, getDb, adminAvailable } = require('../server/firebaseAdmin');

const PLAIN_CODES_FILE = path.join(process.cwd(), 'data', 'submission-codes-plain.json');
const HASHED_CODES_FILE = path.join(process.cwd(), 'data', 'submission-access.json');

// Hash the access code for secure storage
const hashAccessCode = (code) => {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
};

// Normalize email
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

// Load access codes (prefer plain codes, fallback to hashed)
const loadAccessCodes = () => {
  // Try to load from hashed codes file (has all 194 teams)
  if (fs.existsSync(HASHED_CODES_FILE)) {
    try {
      const raw = fs.readFileSync(HASHED_CODES_FILE, 'utf8');
      const hashedCodes = JSON.parse(raw);
      
      // Deduplicate by email (keep first occurrence)
      const uniqueMap = new Map();
      for (const entry of hashedCodes) {
        const email = normalizeEmail(entry.leadEmail);
        if (!uniqueMap.has(email)) {
          uniqueMap.set(email, entry);
        }
      }
      
      return Array.from(uniqueMap.values());
    } catch (error) {
      console.warn('⚠️  Failed to load hashed codes:', error.message);
    }
  }
  
  // Fallback: try plain codes (has only 187 teams)
  if (fs.existsSync(PLAIN_CODES_FILE)) {
    try {
      const raw = fs.readFileSync(PLAIN_CODES_FILE, 'utf8');
      const plainCodes = JSON.parse(raw);
      // Convert to array with hashes
      return Object.entries(plainCodes).map(([email, data]) => ({
        leadEmail: email,
        teamName: data.teamName,
        accessCodeHash: hashAccessCode(data.code),
        code: data.code
      }));
    } catch (error) {
      throw new Error(`Failed to load plain codes: ${error.message}`);
    }
  }
  
  throw new Error('No access codes file found');
};

async function updateRegistrationsWithCodes() {
  const confirmFlag = process.argv.includes('--confirm');
  
  console.log('🚀 Update Firebase Registrations with Access Codes\n');
  console.log('━'.repeat(60));
  
  if (!confirmFlag) {
    console.log('⚠️  DRY RUN MODE - No changes will be made to Firebase\n');
    console.log('   Run with --confirm to apply changes\n');
  }
  
  try {
    // Initialize Firebase Admin
    initAdmin();
    if (!adminAvailable()) {
      throw new Error('Firebase Admin SDK not initialized. Check your .env file for FIREBASE_PROJECT_ID and credentials.');
    }
    console.log('✓ Firebase Admin SDK initialized');
    
    // Load access codes from file
    console.log('📥 Loading access codes...');
    const codeEntries = loadAccessCodes();
    console.log(`✓ Loaded ${codeEntries.length} access codes\n`);
    
    if (codeEntries.length === 0) {
      console.log('⚠️  No access codes found. Nothing to do.');
      process.exit(0);
    }
    
    const db = getDb();
    const registrationsRef = db.collection('teamRegistrations');
    
    let updated = 0;
    let skipped = 0;
    let notFound = 0;
    
    console.log('🔄 Processing registrations...\n');
    
    for (const codeData of codeEntries) {
      const normalizedEmail = normalizeEmail(codeData.leadEmail);
      
      try {
        // Query for the registration document
        const snapshot = await registrationsRef
          .where('lead.email', '==', normalizedEmail)
          .limit(1)
          .get();
        
        if (snapshot.empty) {
          console.log(`  ⚠️  Not found: ${codeData.teamName} (${normalizedEmail})`);
          notFound++;
          continue;
        }
        
        const doc = snapshot.docs[0];
        const docRef = registrationsRef.doc(doc.id);
        
        if (confirmFlag) {
          // Update the document with the access code hash
          await docRef.update({
            submissionAccessCodeHash: codeData.accessCodeHash,
            submissionAccessCodeUpdatedAt: new Date().toISOString()
          });
          console.log(`  ✓ Updated: ${codeData.teamName} (${normalizedEmail})`);
          updated++;
        } else {
          console.log(`  ✓ Would update: ${codeData.teamName} (${normalizedEmail})`);
          updated++;
        }
        
      } catch (error) {
        console.error(`  ✗ Error processing ${normalizedEmail}:`, error.message);
        skipped++;
      }
    }
    
    console.log('\n' + '━'.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ${confirmFlag ? 'Updated' : 'Would update'}: ${updated}`);
    console.log(`   Not found: ${notFound}`);
    console.log(`   Errors: ${skipped}`);
    console.log(`   Total: ${codeEntries.length}`);
    
    if (!confirmFlag) {
      console.log('\n⚠️  DRY RUN - No changes were made');
      console.log('   Run with --confirm to apply changes');
    } else {
      console.log('\n✅ Done! Registration documents updated with access code hashes.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
updateRegistrationsWithCodes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
