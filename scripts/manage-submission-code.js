#!/usr/bin/env node

/**
 * Manage submission access codes for individual teams
 * 
 * Usage:
 *   node scripts/manage-submission-code.js generate team@example.com "Team Name"
 *   node scripts/manage-submission-code.js verify team@example.com CODE-HERE-1234
 *   node scripts/manage-submission-code.js show team@example.com
 *   node scripts/manage-submission-code.js reset team@example.com
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { initAdmin, getDb, adminAvailable } = require('../server/firebaseAdmin');
const { findTeamRegistrationByLeadEmail } = require('../server/services/teamRegistrations');

const SUBMISSION_ACCESS_FILE = path.join(process.cwd(), 'data', 'submission-access.json');
const PLAIN_CODES_FILE = path.join(process.cwd(), 'data', 'submission-codes-plain.json');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const hashAccessCode = (code) => {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
};

const generateAccessCode = (length = 12) => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length);
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += characters[bytes[i] % characters.length];
  }
  
  return code.match(/.{1,4}/g).join('-');
};

const loadJSON = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return filePath.includes('plain') ? {} : [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to load ${filePath}:`, error.message);
    return filePath.includes('plain') ? {} : [];
  }
};

const saveJSON = (filePath, data) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

async function generateCode(email, teamName) {
  const normalized = normalizeEmail(email);
  
  console.log(`\n🔐 Generating access code for ${normalized}...\n`);
  
  // Fetch registration
  const registration = await findTeamRegistrationByLeadEmail(normalized);
  if (!registration) {
    throw new Error(`No registration found for ${normalized}`);
  }
  
  const actualTeamName = teamName || registration.teamName;
  
  // Generate code
  const accessCode = generateAccessCode();
  const accessCodeHash = hashAccessCode(accessCode);
  
  // Load existing data
  const hashedCodes = loadJSON(SUBMISSION_ACCESS_FILE);
  const plainCodes = loadJSON(PLAIN_CODES_FILE);
  
  // Update hashed codes
  const existingIndex = hashedCodes.findIndex(e => normalizeEmail(e.leadEmail) === normalized);
  const hashEntry = {
    leadEmail: normalized,
    accessCodeHash,
    teamName: actualTeamName,
    campus: registration.campus,
    batch: registration.batch,
    generatedAt: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    hashedCodes[existingIndex] = hashEntry;
    console.log('⚠️  Replacing existing code');
  } else {
    hashedCodes.push(hashEntry);
  }
  
  // Update plain codes
  plainCodes[normalized] = {
    code: accessCode,
    teamName: actualTeamName,
    leadEmail: normalized,
    leadName: registration.lead?.name,
  };
  
  // Save
  saveJSON(SUBMISSION_ACCESS_FILE, hashedCodes);
  saveJSON(PLAIN_CODES_FILE, plainCodes);
  
  console.log('✓ Code generated and saved\n');
  console.log('━'.repeat(60));
  console.log(`Team:        ${actualTeamName}`);
  console.log(`Lead Email:  ${normalized}`);
  console.log(`Access Code: ${accessCode}`);
  console.log(`Hash:        ${accessCodeHash.substring(0, 32)}...`);
  console.log('━'.repeat(60));
  
  // Save to Firebase if available
  if (adminAvailable()) {
    const db = getDb();
    await db.collection('submissionAccessKeys').doc(normalized).set({
      code: accessCode,
      hash: accessCodeHash,
      teamName: actualTeamName,
      leadEmail: normalized,
      leadName: registration.lead?.name,
      generatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('\n✓ Saved to Firebase');
  }
  
  console.log('\nNext: Send code to team using:');
  console.log(`  node scripts/send-submission-codes.js --team-email ${email} --confirm`);
  console.log('\nOr test first:');
  console.log(`  node scripts/send-submission-codes.js --test your-email@example.com\n`);
}

async function verifyCode(email, code) {
  const normalized = normalizeEmail(email);
  const hash = hashAccessCode(code);
  
  console.log(`\n🔍 Verifying code for ${normalized}...\n`);
  
  const hashedCodes = loadJSON(SUBMISSION_ACCESS_FILE);
  const entry = hashedCodes.find(e => normalizeEmail(e.leadEmail) === normalized);
  
  if (!entry) {
    console.log('❌ No code found for this email\n');
    return;
  }
  
  const isValid = entry.accessCodeHash === hash;
  
  console.log('━'.repeat(60));
  console.log(`Team:         ${entry.teamName}`);
  console.log(`Lead Email:   ${normalized}`);
  console.log(`Code Valid:   ${isValid ? '✅ YES' : '❌ NO'}`);
  console.log(`Expected:     ${entry.accessCodeHash.substring(0, 32)}...`);
  console.log(`Received:     ${hash.substring(0, 32)}...`);
  console.log('━'.repeat(60));
  console.log('');
}

async function showCode(email) {
  const normalized = normalizeEmail(email);
  
  console.log(`\n📋 Access code for ${normalized}...\n`);
  
  const plainCodes = loadJSON(PLAIN_CODES_FILE);
  const codeData = plainCodes[normalized];
  
  if (!codeData) {
    console.log('❌ No code found for this email\n');
    return;
  }
  
  console.log('━'.repeat(60));
  console.log(`Team:        ${codeData.teamName}`);
  console.log(`Lead Name:   ${codeData.leadName || 'N/A'}`);
  console.log(`Lead Email:  ${normalized}`);
  console.log(`Access Code: ${codeData.code}`);
  console.log('━'.repeat(60));
  console.log('');
}

async function resetCode(email) {
  const normalized = normalizeEmail(email);
  
  console.log(`\n🔄 Resetting code for ${normalized}...\n`);
  console.log('⚠️  WARNING: This will invalidate the existing code!\n');
  
  // Fetch registration to get team name
  const registration = await findTeamRegistrationByLeadEmail(normalized);
  if (!registration) {
    throw new Error(`No registration found for ${normalized}`);
  }
  
  await generateCode(email, registration.teamName);
  console.log('\n✅ Code has been reset. Don\'t forget to notify the team!\n');
}

async function main() {
  const [,, command, email, ...args] = process.argv;
  
  if (!command || !email) {
    console.log(`
Usage:
  node scripts/manage-submission-code.js generate <email> [teamName]
  node scripts/manage-submission-code.js verify <email> <code>
  node scripts/manage-submission-code.js show <email>
  node scripts/manage-submission-code.js reset <email>

Examples:
  node scripts/manage-submission-code.js generate team@example.com "Team Alpha"
  node scripts/manage-submission-code.js verify team@example.com ABCD-EFGH-IJKL
  node scripts/manage-submission-code.js show team@example.com
  node scripts/manage-submission-code.js reset team@example.com
    `);
    process.exit(1);
  }
  
  try {
    initAdmin();
    
    switch (command) {
      case 'generate':
        await generateCode(email, args.join(' '));
        break;
      case 'verify':
        if (!args[0]) {
          throw new Error('Code is required for verify command');
        }
        await verifyCode(email, args[0]);
        break;
      case 'show':
        await showCode(email);
        break;
      case 'reset':
        await resetCode(email);
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
