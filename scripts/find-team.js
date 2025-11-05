#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { initAdmin, adminAvailable } = require('../server/firebaseAdmin');
const { findTeamRegistrationByLeadEmail } = require('../server/services/teamRegistrations');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

async function main() {
  const email = normalizeEmail(process.argv[2]);
  if (!email) {
    console.error('Usage: node scripts/find-team.js <lead-email>');
    process.exit(1);
  }

  initAdmin();
  if (!adminAvailable()) {
    console.error('Firebase Admin SDK not available. Check credentials.');
    process.exit(1);
  }

  const team = await findTeamRegistrationByLeadEmail(email);

  if (!team) {
    console.log(`No registration found for ${email}`);
    return;
  }

  console.log(JSON.stringify(team, null, 2));
}

main().catch((err) => {
  console.error('Failed to fetch team:', err);
  process.exit(1);
});
