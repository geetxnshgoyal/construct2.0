#!/usr/bin/env node

/**
 * Quick helper to fire a registration email using the existing mail service.
 * Fill in realistic details below before running:
 *
 *   node scripts/send-test-email.js
 *
 * Ensure your SMTP credentials are present in `.env` so the mailer can authenticate.
 */

const path = require('path');
const dotenvPath = path.join(process.cwd(), '.env');
require('dotenv').config({ path: dotenvPath });

const { notifyTeamRegistration } = require('../server/services/email');

const registration = {
  teamName: 'Team Mayday',
  teamSize: 1,
  campus: 'NST-RU',
  batch: 'Batch 2024',
  lead: {
    name: 'Geetansh Goyal',
    email: 'goyalgeetansh@gmail.com',
    gender: 'Male',
  },
  members: [],
  emails: ['goyalgeetansh@gmail.com'],
  submittedAt: new Date().toISOString(),
};

notifyTeamRegistration(registration)
  .then(() => {
    console.log('Test registration email dispatched.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to send test registration email:', error);
    process.exit(1);
  });
