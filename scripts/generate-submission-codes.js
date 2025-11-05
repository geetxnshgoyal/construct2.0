#!/usr/bin/env node

/**
 * Generate submission access codes for registered teams
 * 
 * This script:
 * 1. Fetches all team registrations from Firebase
 * 2. Generates a unique 12-character access code for each team
 * 3. Hashes the code and stores it in data/submission-access.json
 * 4. Optionally saves the plain codes to Firebase for email distribution
 * 
 * Usage:
 *   node scripts/generate-submission-codes.js
 *   node scripts/generate-submission-codes.js --update-existing
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { initAdmin, getDb, adminAvailable } = require('../server/firebaseAdmin');
const { listTeamRegistrations } = require('../server/services/teamRegistrations');

const SUBMISSION_ACCESS_FILE = path.join(process.cwd(), 'data', 'submission-access.json');
const PLAIN_CODES_FILE = path.join(process.cwd(), 'data', 'submission-codes-plain.json');

// Generate a cryptographically secure random access code
const generateAccessCode = (length = 12) => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars: I, O, 0, 1
  const bytes = crypto.randomBytes(length);
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += characters[bytes[i] % characters.length];
  }
  
  // Format as XXXX-XXXX-XXXX for readability
  return code.match(/.{1,4}/g).join('-');
};

// Hash the access code for secure storage
const hashAccessCode = (code) => {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
};

// Normalize email
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

// Load existing access codes
const loadExistingAccessCodes = () => {
  if (!fs.existsSync(SUBMISSION_ACCESS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(SUBMISSION_ACCESS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('⚠️  Failed to load existing access codes:', error.message);
    return [];
  }
};

// Load plain codes if they exist
const loadPlainCodes = () => {
  if (!fs.existsSync(PLAIN_CODES_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(PLAIN_CODES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('⚠️  Failed to load plain codes:', error.message);
    return {};
  }
};

async function generateSubmissionCodes() {
  const updateExisting = process.argv.includes('--update-existing');
  
  console.log('🚀 CoNSTruct Submission Code Generator\n');
  console.log('━'.repeat(60));
  
  try {
    // Initialize Firebase Admin
    initAdmin();
    if (!adminAvailable()) {
      throw new Error('Firebase Admin SDK not available. Check your credentials.');
    }
    console.log('✓ Firebase Admin SDK initialized');
    
    // Fetch all registrations
    console.log('📥 Fetching team registrations...');
    const registrations = await listTeamRegistrations({ limit: 1000 });
    console.log(`✓ Found ${registrations.length} team registrations\n`);
    
    if (registrations.length === 0) {
      console.log('⚠️  No registrations found. Nothing to do.');
      process.exit(0);
    }
    
    // Load existing codes
    const existingAccessCodes = loadExistingAccessCodes();
    const existingMap = new Map(
      existingAccessCodes.map(entry => [normalizeEmail(entry.leadEmail), entry])
    );
    
    const plainCodes = loadPlainCodes();
    const newAccessCodes = [];
    const newPlainCodes = { ...plainCodes };
    
    let newCount = 0;
    let existingCount = 0;
    
    console.log('🔐 Generating access codes...\n');
    
    for (const registration of registrations) {
      const leadEmail = normalizeEmail(registration.lead?.email);
      
      if (!leadEmail) {
        console.log(`⚠️  Skipping registration without lead email: ${registration.teamName}`);
        continue;
      }
      
      const existing = existingMap.get(leadEmail);
      
      if (existing && !updateExisting) {
        // Keep existing code
        newAccessCodes.push(existing);
        existingCount++;
        console.log(`  ↻ ${registration.teamName} (${leadEmail}) - Using existing code`);
      } else {
        // Generate new code
        const accessCode = generateAccessCode();
        const accessCodeHash = hashAccessCode(accessCode);
        
        const entry = {
          leadEmail,
          accessCodeHash,
          teamName: registration.teamName,
          campus: registration.campus,
          batch: registration.batch,
          generatedAt: new Date().toISOString()
        };
        
        newAccessCodes.push(entry);
        newPlainCodes[leadEmail] = {
          code: accessCode,
          teamName: registration.teamName,
          leadEmail,
          leadName: registration.lead?.name,
        };
        
        newCount++;
        console.log(`  ✓ ${registration.teamName} (${leadEmail}) - ${accessCode}`);
      }
    }
    
    console.log('\n' + '━'.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   New codes generated: ${newCount}`);
    console.log(`   Existing codes kept: ${existingCount}`);
    console.log(`   Total: ${newAccessCodes.length}`);
    
    // Save hashed codes to JSON
    console.log('\n💾 Saving access codes...');
    
    // Ensure data directory exists
    const dataDir = path.dirname(SUBMISSION_ACCESS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(
      SUBMISSION_ACCESS_FILE,
      JSON.stringify(newAccessCodes, null, 2),
      'utf8'
    );
    console.log(`✓ Hashed codes saved to: ${SUBMISSION_ACCESS_FILE}`);
    
    // Save plain codes (WARNING: Keep this secure!)
    fs.writeFileSync(
      PLAIN_CODES_FILE,
      JSON.stringify(newPlainCodes, null, 2),
      'utf8'
    );
    console.log(`✓ Plain codes saved to: ${PLAIN_CODES_FILE}`);
    console.log('⚠️  WARNING: Keep submission-codes-plain.json SECURE and never commit it!');
    
    // Optionally save to Firebase for easy email distribution
    if (adminAvailable() && newCount > 0) {
      console.log('\n☁️  Uploading to Firebase...');
      const db = getDb();
      const batch = db.batch();
      
      let uploadCount = 0;
      for (const [email, data] of Object.entries(newPlainCodes)) {
        if (plainCodes[email] && !updateExisting) continue; // Skip if already in Firebase
        
        const docRef = db.collection('submissionAccessKeys').doc(email);
        batch.set(docRef, {
          code: data.code,
          hash: hashAccessCode(data.code),
          teamName: data.teamName,
          leadEmail: email,
          leadName: data.leadName,
          generatedAt: new Date().toISOString(),
        }, { merge: true });
        
        uploadCount++;
      }
      
      if (uploadCount > 0) {
        await batch.commit();
        console.log(`✓ Uploaded ${uploadCount} codes to Firebase`);
      } else {
        console.log('  No new codes to upload to Firebase');
      }
    }
    
    console.log('\n✅ Done! Next steps:');
    console.log('   1. Review the generated codes in data/submission-codes-plain.json');
    console.log('   2. Run: node scripts/send-submission-codes.js to email teams');
    console.log('   3. Add data/submission-codes-plain.json to .gitignore (if not already)\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the generator
generateSubmissionCodes();
