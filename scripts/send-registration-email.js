#!/usr/bin/env node

const path = require('path');

// Load environment configuration before importing the email service.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Force confirmation emails even if disabled in the environment.
process.env.EMAIL_SEND_CONFIRMATION = 'true';

const { notifyTeamRegistration } = require('../server/services/email');

const [, , recipient, teamNameArg, leadNameArg] = process.argv;

if (!recipient) {
  console.error('Usage: node scripts/send-registration-email.js <recipient-email> [team-name] [lead-name]');
  process.exit(1);
}

const teamName = teamNameArg || 'CoNSTruct Test Team';
const leadName = leadNameArg || 'CoNSTruct Test Lead';

const registration = {
  teamName,
  teamSize: 1,
  campus: 'NST-Svyasa',
  batch: 'Batch 2025',
  lead: {
    name: leadName,
    email: recipient,
    gender: 'Prefer not to say',
  },
  members: [],
  emails: [recipient],
  submittedAt: new Date().toISOString(),
};

async function main() {
  try {
    await notifyTeamRegistration(registration);
    console.log(`✅ Registration-style email sent to ${recipient}`);
  } catch (error) {
    console.error('❌ Failed to send registration email:', error);
    process.exit(1);
  }
}

main();
