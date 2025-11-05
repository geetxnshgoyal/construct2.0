#!/usr/bin/env node

/**
 * Manually add a team registration to Firebase using the same validation rules
 * as the public registration form.
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { initAdmin, adminAvailable } = require('../server/firebaseAdmin');
const { validateTeamPayload, saveTeamRegistration } = require('../server/services/teamRegistrations');

async function main() {
  initAdmin();
  if (!adminAvailable()) {
    console.error('Firebase Admin SDK not available. Set credentials in .env');
    process.exit(1);
  }

  const teamPayload = {
    teamName: 'Issue Hai',
    teamSize: 4,
    campus: 'NST-ADYPU',
    batch: 'Batch 2025',
    lead: {
      name: 'Harshit Agrawal',
      email: 'harshit.agrawal@adypu.edu.in',
      gender: 'male',
    },
    members: [
      {
        name: 'Krish Jain',
        email: 'krish.jain@adypu.edu.in',
        gender: 'male',
      },
      {
        name: 'Harshit Gupta',
        email: 'harshit.k@adypu.edu.in',
        gender: 'male',
      },
      {
        name: 'Vidhan Pandey',
        email: 'vidhan.pandey@adypu.edu.in',
        gender: 'male',
      },
    ],
  };

  const { status, error, data } = validateTeamPayload(teamPayload);
  if (status !== 200) {
    console.error('Validation failed:', error);
    process.exit(1);
  }

  try {
    await saveTeamRegistration(data);
    console.log('✅ Registration saved for', data.lead.email);
  } catch (err) {
    console.error('❌ Failed to save registration:', err.message);
    process.exit(1);
  }
}

main();
