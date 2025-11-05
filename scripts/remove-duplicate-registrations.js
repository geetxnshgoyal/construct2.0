#!/usr/bin/env node

/**
 * Remove duplicate team registrations in Firebase (by lead email).
 *
 * Keeps the earliest registration per lead email and deletes the rest.
 *
 * Usage:
 *   node scripts/remove-duplicate-registrations.js           # dry run
 *   node scripts/remove-duplicate-registrations.js --confirm # delete duplicates
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { initAdmin, adminAvailable, getDb } = require('../server/firebaseAdmin');
const { listTeamRegistrations } = require('../server/services/teamRegistrations');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const parseTimestamp = (value) => {
  if (!value) return null;
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (value?._seconds) {
    return value._seconds * 1000 + (value._nanoseconds || 0) / 1e6;
  }
  return null;
};

async function removeDuplicateRegistrations() {
  const confirm = process.argv.includes('--confirm');

  console.log('🧹 Remove Duplicate Team Registrations\n');

  initAdmin();
  if (!adminAvailable()) {
    throw new Error('Firebase Admin SDK not available. Check your credentials.');
  }

  const registrations = await listTeamRegistrations({ limit: 2000 });
  console.log(`📥 Retrieved ${registrations.length} registrations\n`);

  const buckets = new Map();

  for (const registration of registrations) {
    const email = normalizeEmail(registration.lead?.email);
    if (!email) continue;

    if (!buckets.has(email)) {
      buckets.set(email, []);
    }

    const createdAt = parseTimestamp(
      registration.createdAt ||
        registration.created_at ||
        registration.created_at_ms ||
        registration.created_at_ts ||
        registration.created ||
        null
    );

    buckets.get(email).push({
      email,
      teamName: registration.teamName,
      docId: registration.id || registration.docId || registration.docID || null,
      createdAt,
      raw: registration,
    });
  }

  const duplicates = Array.from(buckets.values())
    .map((entries) => {
      if (entries.length <= 1) return null;

      const sorted = entries.slice().sort((a, b) => {
        if (a.createdAt !== null && b.createdAt !== null) {
          return b.createdAt - a.createdAt; // newest first
        }
        if (a.createdAt !== null) return -1;
        if (b.createdAt !== null) return 1;
        return (b.docId || '').localeCompare(a.docId || '');
      });

      return {
        email: sorted[0].email,
        keep: sorted[0],
        remove: sorted.slice(1),
      };
    })
    .filter(Boolean);

  if (duplicates.length === 0) {
    console.log('✅ No duplicate lead emails found. Nothing to delete.');
    return;
  }

  console.log(`⚠️  Found ${duplicates.length} lead emails with duplicate registrations:`);
  let totalDeletes = 0;

  for (const dup of duplicates) {
    console.log(`\n• ${dup.email}`);
    console.log(`   Keeping latest: ${dup.keep.teamName || 'Untitled'} (doc: ${dup.keep.docId || 'unknown'})`);

    dup.remove.forEach((entry, index) => {
      console.log(`   Remove ${index + 1}: ${entry.teamName || 'Untitled'} (doc: ${entry.docId || 'unknown'})`);
    });

    totalDeletes += dup.remove.length;
  }

  console.log(`\n📊 Summary: would delete ${totalDeletes} duplicate documents`);

  if (!confirm) {
    console.log('\n💡 Dry-run only. Re-run with --confirm to delete the duplicates.');
    return;
  }

  const db = getDb();

  console.log('\n🗑️  Deleting duplicate documents...');

  for (const dup of duplicates) {
    for (const entry of dup.remove) {
      if (!entry.docId) {
        console.warn(`   ⚠️  Skipping ${entry.teamName || 'Untitled'} (missing doc id)`);
        continue;
      }

      await db.collection('teamRegistrations').doc(entry.docId).delete();
      console.log(`   ✓ Deleted ${entry.teamName || 'Untitled'} (doc: ${entry.docId})`);
    }
  }

  console.log('\n✅ Done. Duplicate registrations removed.');
}

removeDuplicateRegistrations().catch((error) => {
  console.error('\n❌ Failed to remove duplicates:', error.message);
  process.exit(1);
});
