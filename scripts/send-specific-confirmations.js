#!/usr/bin/env node

/**
 * Sends the registration confirmation email to a fixed list of team leads.
 * Team members are automatically CC'ed via sendRegistrationConfirmation.
 *
 * Usage: node scripts/send-specific-confirmations.js [--dry-run] [--delay 2000]
 *        [--no-mark] [--field confirmationEmailLastSentAt]
 */

const path = require('path');
const args = process.argv.slice(2);

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const targetLeads = [
  '2102508785@svyasa-sas.edu.in',
  '2102508716@svyasa-sas.edu.in'
];

const { initAdmin, adminAvailable, getDb, serverTimestamp } = require('../server/firebaseAdmin');
const { sendRegistrationConfirmation } = require('../server/services/email');

const parseCliOptions = () => {
  const options = {
    dryRun: false,
    delay: 0,
    markSent: true,
    sentField: 'confirmationEmailLastSentAt',
  };

  args.forEach((arg, index) => {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--delay') {
      const value = Number.parseInt(args[index + 1], 10);
      if (!Number.isNaN(value) && value >= 0) {
        options.delay = value;
      }
    } else if (arg === '--no-mark') {
      options.markSent = false;
    } else if (arg === '--field') {
      const value = args[index + 1];
      if (value) {
        options.sentField = value;
      }
    }
  });

  return options;
};

const chunk = (input, size) => {
  const result = [];
  for (let index = 0; index < input.length; index += size) {
    result.push(input.slice(index, index + size));
  }
  return result;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  if (!targetLeads.length) {
    console.log('No target leads provided.');
    return;
  }

  const { dryRun, delay, markSent, sentField } = parseCliOptions();

  try {
    initAdmin();
  } catch (error) {
    console.error('Failed to initialise Firebase Admin SDK:', error.message);
    process.exit(1);
  }

  if (!adminAvailable()) {
    console.error('Firebase Admin credentials are required to send targeted confirmations.');
    process.exit(1);
  }

  const db = getDb();
  const emailToRegistration = new Map();
  const missing = new Set(targetLeads.map((email) => email.toLowerCase()));

  // Firestore "in" queries accept up to 10 values at a time.
  for (const batch of chunk(targetLeads, 10)) {
    const snapshot = await db
      .collection('teamRegistrations')
      .where('lead.email', 'in', batch)
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const leadEmail = (data?.lead?.email || '').toLowerCase();
      if (leadEmail) {
        emailToRegistration.set(leadEmail, { docRef: doc.ref, data });
        missing.delete(leadEmail);
      }
    });
  }

  if (missing.size) {
    console.warn('Warning: No registration found for the following lead emails:');
    missing.forEach((email) => console.warn(` - ${email}`));
  }

  let sentCount = 0;
  let failedCount = 0;

  for (const email of targetLeads) {
    const key = email.toLowerCase();
    const entry = emailToRegistration.get(key);
    if (!entry) {
      console.warn(`Skipping ${email}: registration not found.`);
      continue;
    }

    const { docRef, data } = entry;
    const registration = Object.assign({}, data, {
      submittedAt:
        data.submittedAt && typeof data.submittedAt.toDate === 'function'
          ? data.submittedAt.toDate().toISOString()
          : data.submittedAt || null,
    });

    if (dryRun) {
      console.log(`[DRY RUN] Would send confirmation to ${email} (team: ${registration.teamName})`);
      continue;
    }

    try {
      await sendRegistrationConfirmation(registration);
      sentCount += 1;
      console.log(`✅ Sent confirmation to ${email} (team: ${registration.teamName})`);

      if (markSent && sentField) {
        try {
          await docRef.update({ [sentField]: serverTimestamp() });
        } catch (updateError) {
          console.warn(
            `⚠️  Confirmation sent to ${email} but failed to update '${sentField}':`,
            updateError.message
          );
        }
      }
    } catch (error) {
      failedCount += 1;
      const reason = error?.response || error?.message || String(error);
      console.error(`❌ Failed to send to ${email} (team: ${registration.teamName}):`, reason);
    }

    if (delay > 0) {
      await wait(delay);
    }
  }

  if (!dryRun) {
    console.log(`\nSummary: ${sentCount} sent, ${failedCount} failed.`);
  } else {
    console.log('\nDry run complete.');
  }
};

main().catch((error) => {
  console.error('Unexpected error while sending specific confirmations:', error);
  process.exit(1);
});
