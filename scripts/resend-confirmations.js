#!/usr/bin/env node

const path = require('path');
const args = process.argv.slice(2);

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { initAdmin, adminAvailable, getDb, serverTimestamp } = require('../server/firebaseAdmin');
const { sendRegistrationConfirmation } = require('../server/services/email');

const parseArgs = () => {
  const options = {
    limit: null,
    dryRun: false,
    delay: 500,
    skipSent: false,
    markSent: true,
    sentField: 'confirmationEmailLastSentAt',
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
    } else if (arg === '--skip-sent') {
      options.skipSent = true;
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  const { limit, dryRun, delay, skipSent, markSent, sentField } = parseArgs();

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

  console.log(
    `Preparing to resend confirmation emails for ${snapshot.size} registrations${dryRun ? ' (dry run)' : ''}.`
  );

  const successes = [];
  const failures = [];
  const skipped = [];

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

    const sentMarker = sentField ? registration[sentField] : null;
    if (skipSent && sentMarker) {
      const sentDate =
        sentMarker && typeof sentMarker.toDate === 'function'
          ? sentMarker.toDate().toISOString()
          : sentMarker;
      skipped.push({ email: leadEmail, team: registration.teamName, sentDate });
      console.log(
        `⏭️  Skipping ${leadEmail} (team: ${registration.teamName}) — already marked sent${sentDate ? ` on ${sentDate}` : ''}.`
      );
      continue;
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would send to ${leadEmail} (team: ${registration.teamName})`);
      continue;
    }

    try {
      await sendRegistrationConfirmation(registration);
      if (markSent && sentField) {
        try {
          await doc.ref.update({
            [sentField]: serverTimestamp(),
          });
        } catch (updateError) {
          console.warn(
            `⚠️  Sent to ${leadEmail} (team: ${registration.teamName}) but failed to mark '${sentField}':`,
            updateError.message
          );
        }
      }
      successes.push({ email: leadEmail, team: registration.teamName });
      console.log(`✅ Sent to ${leadEmail} (team: ${registration.teamName})`);
    } catch (error) {
      const reason = error?.response || error?.message || String(error);
      failures.push({ email: leadEmail, team: registration.teamName, reason });
      console.error(`❌ Failed to send to ${leadEmail} (team: ${registration.teamName}):`, reason);
    }

    if (delay > 0) {
      await wait(delay);
    }
  }

  console.log('Done.');

  if (successes.length) {
    console.log(`\nSuccessfully sent ${successes.length} confirmation email(s).`);
  }
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length} registration(s) already marked as sent:`);
    skipped.forEach(({ email, team, sentDate }) => {
      console.log(` - ${email} (team: ${team})${sentDate ? ` :: sent ${sentDate}` : ''}`);
    });
  }
  if (failures.length) {
    console.log(`\n${failures.length} confirmation email(s) failed:`);
    failures.forEach(({ email, team, reason }) => {
      console.log(` - ${email} (team: ${team}) :: ${reason}`);
    });
    console.log('\nRe-run with --limit/--delay after your provider cool-down, or export this list for manual follow-up.');
  }
};

main().catch((error) => {
  console.error('Unexpected error while resending confirmation emails:', error);
  process.exit(1);
});
