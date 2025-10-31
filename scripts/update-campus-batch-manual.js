const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { initAdmin, getDb } = require('../server/firebaseAdmin');

const TEAM_ASSIGNMENTS = new Map([
  ['geetansh', { campus: 'NST-Svyasa', batch: 'Batch 2025' }],
  ['hackops', { campus: 'NST-RU', batch: 'Batch 2024' }],
  ['bullseye', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['devclub', { campus: 'NST-RU', batch: 'Batch 2024' }],
  ['prodg', { campus: 'NST-RU', batch: 'Batch 2024' }],
  ['bob the builders', { campus: 'NST-ADYPU', batch: 'Batch 2025' }],
  ['the firefly', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['git push and pray', { campus: 'NST-ADYPU', batch: 'Batch 2025' }],
  ['hack ninjas', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['cosmic pirates', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['just a byte', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['peaky coders', { campus: 'NST-RU', batch: 'Batch 2024' }],
  ['aithos', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['floww', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['golu gang', { campus: 'NST-RU', batch: 'Batch 2024' }],
  ['404foundus', { campus: 'NST-ADYPU', batch: 'Batch 2025' }],
  ['team-11 am club', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['team rawd', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['runtime terror', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['prodifires', { campus: 'NST-ADYPU', batch: 'Batch 2025' }],
  ['the leftovers', { campus: 'NST-Svyasa', batch: 'Batch 2025' }],
  ['team crackcoders', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['hackforge', { campus: 'NST-Svyasa', batch: 'Batch 2025' }],
  ['technova', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['api avengers', { campus: 'NST-ADYPU', batch: 'Batch 2025' }],
  ['debug thugs', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['team phoenix', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['ctrlz revolution', { campus: 'NST-ADYPU', batch: 'Batch 2025' }],
  ['codekami', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['gryffinsdev', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['prodigy programmers', { campus: 'NST-RU', batch: 'Batch 2025' }],
  ['katana', { campus: 'NST-RU', batch: 'Batch 2024' }],
  ['allied', { campus: 'NST-RU', batch: 'Batch 2025' }],
]);

const normalise = (value) =>
  typeof value === 'string'
    ? value
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, ' ')
        .trim()
    : '';

(async () => {
  initAdmin();
  const db = getDb();
  const snapshot = await db.collection('teamRegistrations').get();

  let updated = 0;
  let skipped = 0;

  await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const key = normalise(data.teamName);
      const assignment = TEAM_ASSIGNMENTS.get(key);

      if (!assignment) {
        skipped += 1;
        return;
      }

      await doc.ref.update({
        campus: assignment.campus,
        batch: assignment.batch,
      });

      updated += 1;
      console.log(`Updated ${doc.id}: ${assignment.campus} | ${assignment.batch}`);
    })
  );

  console.log(`Done. Updated ${updated} registrations, skipped ${skipped}.`);
  process.exit(0);
})().catch((error) => {
  console.error('Failed updating campus/batch assignments:', error);
  process.exit(1);
});
