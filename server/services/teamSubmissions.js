const fs = require('fs');
const os = require('os');
const path = require('path');
const { getDb, serverTimestamp, adminAvailable } = require('../firebaseAdmin');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const sanitizeString = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
};

const normalizeUrl = (value) => {
  const trimmed = sanitizeString(value);
  if (!trimmed) {
    return '';
  }
  try {
    const url = new URL(trimmed);
    if (!['https:', 'http:'].includes(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch (error) {
    return '';
  }
};

const sanitizeRegistration = (registration) => {
  if (!registration || typeof registration !== 'object') {
    return null;
  }
  const lead =
    registration.lead && typeof registration.lead === 'object'
      ? Object.assign({}, registration.lead, {
          email: registration.lead.email ? normalizeEmail(registration.lead.email) : null,
        })
      : null;
  return {
    id: registration.id || null,
    teamName: registration.teamName || null,
    teamSize: registration.teamSize || null,
    campus: registration.campus || null,
    batch: registration.batch || null,
    lead,
    members: Array.isArray(registration.members) ? registration.members : [],
    submittedAt: registration.submittedAt || null,
  };
};

const validateTeamSubmission = (payload, { registration = null, accessHash = null } = {}) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { status: 400, error: 'Invalid request body. Expected a JSON object.' };
  }

  const safeRegistration = sanitizeRegistration(registration);

  const projectName = sanitizeString(payload.projectName || payload.teamName);
  const leadEmail = normalizeEmail(payload.leadEmail);
  const deckUrl = normalizeUrl(payload.deckUrl);
  const demoUrl = normalizeUrl(payload.demoUrl);
  const repoUrl = normalizeUrl(payload.repoUrl);
  const documentationUrl = normalizeUrl(payload.documentationUrl || payload.extraDocsUrl);
  const notes = sanitizeString(payload.notes);

  if (!projectName) {
    return { status: 400, error: 'Project name is required.' };
  }

  if (!leadEmail || !EMAIL_REGEX.test(leadEmail)) {
    return { status: 400, error: 'Provide a valid contact email for the team lead.' };
  }

  if (safeRegistration && safeRegistration.lead?.email && safeRegistration.lead.email !== leadEmail) {
    return { status: 400, error: 'Lead email does not match the registered record.' };
  }

  if (!deckUrl) {
    return { status: 400, error: 'Pitch deck link is required. Share an accessible URL.' };
  }

  if (!repoUrl) {
    return { status: 400, error: 'Git repository URL is required for final submissions.' };
  }

  const submission = {
    projectName,
    teamName: (registration && registration.teamName) || projectName,
    leadEmail,
    deckUrl,
    demoUrl: demoUrl || null,
    repoUrl,
    documentationUrl: documentationUrl || null,
    notes: notes || null,
    submittedAt: serverTimestamp(),
    accessHash: accessHash || null,
  };

  if (safeRegistration) {
    submission.registration = safeRegistration;
  }

  return { status: 200, data: submission };
};

const getWritableDataDir = () => {
  const preferred = path.join(process.cwd(), 'data');
  try {
    fs.mkdirSync(preferred, { recursive: true });
    return preferred;
  } catch (error) {
    if (error.code !== 'EROFS' && error.code !== 'EACCES') {
      throw error;
    }
  }

  const fallback = path.join(os.tmpdir(), 'construct-submissions');
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
};

const saveTeamSubmission = async (record) => {
  if (adminAvailable()) {
    const db = getDb();
    await db.collection('teamSubmissions').add(record);
    return;
  }

  const dir = getWritableDataDir();
  const filePath = path.join(dir, 'local-submissions.json');
  const nowIso = new Date().toISOString();

  const entry = Object.assign({}, record, {
    submittedAt: nowIso,
    _localSavedAt: nowIso,
    _id: `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });

  let existing = [];
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8') || '[]';
      existing = JSON.parse(raw);
    } catch (error) {
      existing = [];
    }
  }

  existing.unshift(entry);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf8');
};

const listTeamSubmissions = async ({ limit = 100 } = {}) => {
  if (!adminAvailable()) {
    const candidates = [
      path.join(process.cwd(), 'data', 'local-submissions.json'),
      path.join(os.tmpdir(), 'construct-submissions', 'local-submissions.json'),
    ];

    const filePath = candidates.find((candidate) => fs.existsSync(candidate));
    if (!filePath) {
      return [];
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf8') || '[]';
      const list = JSON.parse(raw);
      return list.slice(0, Math.min(list.length, Number.parseInt(limit, 10) || 100));
    } catch (error) {
      return [];
    }
  }

  const db = getDb();
  let query = db.collection('teamSubmissions').orderBy('submittedAt', 'desc');
  const numericLimit = Number.parseInt(limit, 10);
  if (!Number.isNaN(numericLimit) && numericLimit > 0) {
    query = query.limit(Math.min(numericLimit, 300));
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const submittedAt =
      data.submittedAt && typeof data.submittedAt.toDate === 'function'
        ? data.submittedAt.toDate().toISOString()
        : null;
    return {
      id: doc.id,
      projectName: data.projectName || null,
      teamName: data.teamName,
      leadEmail: data.leadEmail,
      deckUrl: data.deckUrl,
      demoUrl: data.demoUrl || null,
      repoUrl: data.repoUrl || null,
      documentationUrl: data.documentationUrl || null,
      notes: data.notes || null,
      registration: data.registration || null,
      accessHash: data.accessHash || null,
      submittedAt,
    };
  });
};

module.exports = {
  validateTeamSubmission,
  saveTeamSubmission,
  listTeamSubmissions,
};
