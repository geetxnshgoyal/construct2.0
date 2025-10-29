#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const { initAdmin, getDb, adminAvailable } = require('../server/firebaseAdmin');

const BLOCKED_EMAIL_DOMAINS = new Set(['test.edu.in']);
const BATCH_SIZE = Number.parseInt(process.env.PURGE_BATCH_SIZE || '200', 10);
const DELETE_DELAY_MS = Number.parseInt(process.env.PURGE_DELETE_DELAY_MS || '50', 10);
const RETRY_DELAY_MS = Number.parseInt(process.env.PURGE_RETRY_DELAY_MS || '1000', 10);
const MAX_RETRIES = Number.parseInt(process.env.PURGE_MAX_RETRIES || '5', 10);
const BATCH_DELAY_MS = Number.parseInt(process.env.PURGE_BATCH_DELAY_MS || '500', 10);

const isBlockedEmail = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  const [, domain = ''] = normalized.split('@');
  return BLOCKED_EMAIL_DOMAINS.has(domain);
};

const collectEmails = (record = {}) => {
  const emails = [];
  if (record.lead?.email) {
    emails.push(record.lead.email);
  }
  if (Array.isArray(record.members)) {
    for (const member of record.members) {
      if (member?.email) {
        emails.push(member.email);
      }
    }
  }
  return emails;
};

const run = async ({ apply }) => {
  const app = initAdmin();
  if (!adminAvailable()) {
    console.error('Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH.');
    process.exit(1);
  }

  const db = getDb();

  let lastDoc = null;
  let scanned = 0;
  let flagged = 0;
  let deleted = 0;

  while (true) {
    let query = db.collection('teamRegistrations').orderBy('submittedAt', 'desc').limit(BATCH_SIZE);
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    for (const doc of snapshot.docs) {
      scanned += 1;

      const data = doc.data() || {};
      const emails = collectEmails(data);

      if (emails.some(isBlockedEmail)) {
        flagged += 1;
        const leadEmail = data.lead?.email || '<unknown>';
        const teamName = data.teamName || '<unnamed>';
        console.log(`[MATCH] ${doc.id} :: ${teamName} :: ${leadEmail}`);

        if (apply) {
          let attempt = 0;
          while (true) {
            try {
              await doc.ref.delete();
              break;
            } catch (error) {
              attempt += 1;
              if (error.code === 8 && attempt <= MAX_RETRIES) {
                const waitTime = RETRY_DELAY_MS * attempt;
                console.warn(
                  `[RETRY] ${doc.id} :: resource exhausted (attempt ${attempt}/${MAX_RETRIES}). Waiting ${waitTime}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, waitTime));
                continue;
              }
              throw error;
            }
          }
          if (DELETE_DELAY_MS > 0) {
            await new Promise((resolve) => setTimeout(resolve, DELETE_DELAY_MS));
          }
          deleted += 1;
        }
      }
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];

    if (BATCH_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log(`Scanned: ${scanned} | Flagged: ${flagged} | Deleted: ${deleted} | Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
};

const apply = process.argv.includes('--apply');

run({ apply })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error while purging registrations:', error);
    process.exit(1);
  });
