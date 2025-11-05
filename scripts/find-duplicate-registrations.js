#!/usr/bin/env node

/**
 * Scan Firebase team registrations and surface duplicate entries grouped by lead email.
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { initAdmin, adminAvailable } = require('../server/firebaseAdmin');
const { listTeamRegistrations } = require('../server/services/teamRegistrations');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

async function findDuplicates() {
  console.log('🔍 Scanning Firebase registrations for duplicates\n');

  initAdmin();
  if (!adminAvailable()) {
    throw new Error('Firebase Admin SDK not available. Check your credentials.');
  }

  const registrations = await listTeamRegistrations({ limit: 2000 });
  console.log(`📥 Retrieved ${registrations.length} registrations\n`);

  const buckets = new Map();

  for (const registration of registrations) {
    const email = normalizeEmail(registration.lead?.email);
    if (!email) {
      continue;
    }

    if (!buckets.has(email)) {
      buckets.set(email, []);
    }

    buckets.get(email).push({
      teamName: registration.teamName,
      campus: registration.campus,
      batch: registration.batch,
      createdAt: registration.createdAt || registration.created_at || null,
      docId: registration.id || registration.docId || null,
      raw: registration,
    });
  }

  const duplicates = Array.from(buckets.entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([email, entries]) => ({ email, entries }));

  if (duplicates.length === 0) {
    console.log('✅ No duplicate lead emails found.');
    return;
  }

  console.log(`⚠️  Found ${duplicates.length} lead emails with duplicate registrations:\n`);

  for (const duplicate of duplicates) {
    console.log(`• ${duplicate.email}`);
    duplicate.entries.forEach((entry, index) => {
      const created = entry.createdAt ? ` @ ${entry.createdAt}` : '';
      const id = entry.docId ? ` (doc: ${entry.docId})` : '';
      console.log(`    ${index + 1}. ${entry.teamName || 'Untitled'}${created}${id}`);
    });
    console.log('');
  }

  console.log('📌 Tip: Remove or merge the unintended duplicates in Firebase to keep counts consistent.');
}

findDuplicates().catch((error) => {
  console.error('\n❌ Failed to scan duplicates:', error.message);
  process.exit(1);
});
