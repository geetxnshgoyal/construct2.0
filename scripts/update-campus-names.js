#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { initAdmin, getDb, adminAvailable } = require('../server/firebaseAdmin');

const CAMPUS_RENAME_MAP = new Map([
  ['NST Delhi', 'NST-RU'],
  ['NST Pune', 'NST-ADYPU'],
  ['NST Bangalore', 'NST-Svyasa'],
]);

const normalizeCampus = (value) => (typeof value === 'string' ? value.trim() : '');

const apply = process.argv.includes('--apply');

(async () => {
  initAdmin();

  if (!adminAvailable()) {
    console.error('Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH.');
    process.exit(1);
  }

  const db = getDb();
  const snapshot = await db.collection('teamRegistrations').get();

  let scanned = 0;
  let matched = 0;
  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    scanned += 1;

    const data = doc.data() || {};
    const currentCampus = normalizeCampus(data.campus);

    if (!currentCampus) {
      skipped += 1;
      continue;
    }

    const targetCampus = CAMPUS_RENAME_MAP.get(currentCampus);

    if (!targetCampus) {
      skipped += 1;
      continue;
    }

    if (currentCampus === targetCampus) {
      skipped += 1;
      continue;
    }

    matched += 1;
    console.log(`[MATCH] ${doc.id} :: ${currentCampus} -> ${targetCampus}`);

    if (!apply) {
      continue;
    }

    await doc.ref.update({ campus: targetCampus });
    updated += 1;
  }

  console.log(
    `Scan complete. Total: ${scanned} | Renamed: ${matched} | Updated: ${updated} | Skipped: ${skipped} | Mode: ${
      apply ? 'APPLY' : 'DRY-RUN'
    }`
  );

  process.exit(0);
})().catch((error) => {
  console.error('Failed to rename campus values:', error);
  process.exit(1);
});
