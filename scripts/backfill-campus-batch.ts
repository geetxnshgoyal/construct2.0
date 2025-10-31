import { initAdmin, getDb } from '../server/firebaseAdmin';

const CAMPUS_DOMAIN_SUFFIXES: Record<string, string> = {
  'NST-RU': 'rishihood.edu.in',
  'NST-ADYPU': 'adypu.edu.in',
  'NST-Svyasa': 'svyasa-sas.edu.in',
};

const campusForEmail = (email: string | null | undefined) => {
  if (!email) {
    return null;
  }
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return (
    Object.entries(CAMPUS_DOMAIN_SUFFIXES).find(([, suffix]) => domain === suffix || domain.endsWith(`.${suffix}`))?.[0] ?? null
  );
};

(async () => {
  initAdmin();
  const db = getDb();

  const snapshot = await db.collection('teamRegistrations').get();
  console.log(`Scanning ${snapshot.size} registrations...`);

  const updates = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const currentCampus = data.campus as string | undefined;
    const currentBatch = data.batch as string | undefined;

    const leadEmail = (data.lead?.email as string | undefined) ?? null;
    const campus = currentCampus ?? campusForEmail(leadEmail);

    if (campus === currentCampus && currentBatch) {
      return;
    }

    await doc.ref.update({
      campus: campus ?? null,
      batch: currentBatch ?? '',
    });
    console.log(`Updated ${doc.id} -> campus: ${campus ?? 'null'}, batch: ${currentBatch ?? ''}`);
  });

  await Promise.all(updates);
  console.log('Backfill complete.');
  process.exit(0);
})().catch((err) => {
  console.error('Failed to backfill campus/batch fields:', err);
  process.exit(1);
});
