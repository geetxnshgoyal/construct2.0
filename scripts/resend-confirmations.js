#!/usr/bin/env node

const path = require('path');
const args = process.argv.slice(2);

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { initAdmin, adminAvailable, getDb } = require('../server/firebaseAdmin');
const { notifyTeamRegistration } = require('../server/services/email');

const parseArgs = () => {
  const options = {
    limit: null,
    dryRun: false,
    delay: 500,
  };

  args.forEach((arg, index) => {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--limit') {
      const value = Number.parseInt(args[index + 1], 10);
      if (!Number.isNaN(value) && value > 0) {
        options.limit = value;
      }
    } else if (arg === '--delay') {
      const value = Number.parseInt(args[index + 1], 10);
      if (!Number.isNaN(value) && value >= 0) {
        options.delay = value;
      }
    }
  });

  return options;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  const { limit, dryRun, delay } = parseArgs();

  try {
    initAdmin();
  } catch (error) {
    console.error('Failed to initialise Firebase Admin SDK:', error.message);
    process.exit(1);
  }

  if (!adminAvailable()) {
    console.error('Firebase Admin credentials are required to resend confirmation emails.');
    process.exit(1);
  }

  const db = getDb();
  let query = db.collection('teamRegistrations').orderBy('submittedAt', 'desc');
  if (typeof limit === 'number' && limit > 0) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();

  if (snapshot.empty) {
    console.log('No registrations found.');
    return;
  }

  console.log(`Preparing to resend confirmation emails for ${snapshot.size} registrations${dryRun ? ' (dry run)' : ''}.`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const submittedAt = data.submittedAt && typeof data.submittedAt.toDate === 'function'
      ? data.submittedAt.toDate().toISOString()
      : data.submittedAt || null;

    const registration = Object.assign({}, data, { submittedAt });

    const leadEmail = registration?.lead?.email;
    if (!leadEmail) {
      console.warn(`Skipping ${doc.id}: missing lead email.`);
      continue;
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would send to ${leadEmail} (team: ${registration.teamName})`);
      continue;
    }

    try {
      await notifyTeamRegistration(registration);
      console.log(`Sent to ${leadEmail} (team: ${registration.teamName})`);
    } catch (error) {
      console.error(`Failed to send to ${leadEmail}:`, error.message);
    }

    if (delay > 0) {
      await wait(delay);
    }
  }

  console.log('Done.');
};

main().catch((error) => {
  console.error('Unexpected error while resending confirmation emails:', error);
  process.exit(1);
});
