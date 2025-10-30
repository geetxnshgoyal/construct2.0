const fs = require('fs');
const os = require('os');
const path = require('path');
const { getDb, serverTimestamp, adminAvailable } = require('../firebaseAdmin');

const CAMPUS_DOMAIN_SUFFIXES = {
  'NST Delhi': 'rishihood.edu.in',
  'NST Pune': 'adypu.edu.in',
  'NST Bangalore': 'svyasa-sas.edu.in',
};
const ALLOWED_EMAIL_DOMAINS = new Set(Object.values(CAMPUS_DOMAIN_SUFFIXES));
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MIN_TEAM_SIZE = 1;
const MAX_TEAM_SIZE = 5;
const MAX_MEMBERS = MAX_TEAM_SIZE - 1;
const CAMPUS_BATCH_RULES = {
  'NST Delhi': ['Batch 2023', 'Batch 2024', 'Batch 2025'],
  'NST Pune': ['Batch 2024', 'Batch 2025'],
  'NST Bangalore': ['Batch 2025'],
};
const ALLOWED_CAMPUSES = new Set(Object.keys(CAMPUS_BATCH_RULES));
const ALLOWED_BATCHES = new Set(['Batch 2023', 'Batch 2024', 'Batch 2025']);

const sanitizeString = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
};

const normalizeEmail = (value) => sanitizeString(value).toLowerCase();

const matchesSuffix = (domain = '', suffix) => domain === suffix || domain.endsWith(`.${suffix}`);

const isAllowedDomain = (email) => {
  const [, domain = ''] = email.split('@');
  return Array.from(ALLOWED_EMAIL_DOMAINS).some((suffix) => matchesSuffix(domain, suffix));
};

const matchesCampusDomain = (email, campus) => {
  const suffix = CAMPUS_DOMAIN_SUFFIXES[campus];
  if (!suffix) {
    return false;
  }
  const [, domain = ''] = email.split('@');
  return matchesSuffix(domain, suffix);
};

const validateTeamPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { status: 400, error: 'Invalid request body. Expected a JSON object.' };
  }

  const teamName = sanitizeString(payload.teamName);
  const teamSizeRaw = sanitizeString(payload.teamSize);
  const teamSize = Number.parseInt(teamSizeRaw, 10);
  const honeypot = sanitizeString(payload.honeypot || payload.website || payload.phone || payload.url);
  const campus = sanitizeString(payload.campus);
  const batch = sanitizeString(payload.batch);

  if (honeypot) {
    return { status: 400, error: 'Submission failed verification. Please contact the organizers if this persists.' };
  }

  if (!teamName) {
    return { status: 400, error: 'Team name is required.' };
  }

  if (!ALLOWED_CAMPUSES.has(campus)) {
    return { status: 400, error: 'Please select your NST campus.' };
  }

  if (!ALLOWED_BATCHES.has(batch)) {
    return { status: 400, error: 'Please select your batch year.' };
  }

  if (!CAMPUS_BATCH_RULES[campus]?.includes(batch)) {
    const allowed = CAMPUS_BATCH_RULES[campus]?.join(', ') || 'the appropriate year';
    return { status: 400, error: `${campus} students can register only for ${allowed}.` };
  }

  if (Number.isNaN(teamSize) || teamSize < MIN_TEAM_SIZE || teamSize > MAX_TEAM_SIZE) {
    return {
      status: 400,
      error: `Team size must be between ${MIN_TEAM_SIZE} and ${MAX_TEAM_SIZE} members (including the leader).`,
    };
  }

  const leadInput = payload.lead || {};
  const leadName = sanitizeString(leadInput.name);
  const leadEmail = normalizeEmail(leadInput.email);
  const leadGender = sanitizeString(leadInput.gender);

  if (!leadName || !leadEmail || !leadGender) {
    return { status: 400, error: 'Team lead name, email, and gender are required.' };
  }

  if (!EMAIL_REGEX.test(leadEmail) || !isAllowedDomain(leadEmail) || !matchesCampusDomain(leadEmail, campus)) {
    const suffix = CAMPUS_DOMAIN_SUFFIXES[campus];
    return { status: 400, error: `Use your official ${campus} student email (@${suffix}).` };
  }

  const membersRaw = Array.isArray(payload.members) ? payload.members : [];
  const members = [];
  let membersError = null;
  const seenEmails = new Set([leadEmail]);

  membersRaw.forEach((member, index) => {
    if (membersError || members.length >= MAX_MEMBERS) return;

    const name = sanitizeString(member.name);
    const email = normalizeEmail(member.email);
    const gender = sanitizeString(member.gender);
    const isRequired = index < (teamSize - 1);

    if (isRequired) {
      if (!name || !email || !gender) {
        membersError = 'Each submitted teammate must include name, college email, and gender.';
        return;
      }
      if (!EMAIL_REGEX.test(email) || !isAllowedDomain(email) || !matchesCampusDomain(email, campus)) {
        const suffix = CAMPUS_DOMAIN_SUFFIXES[campus];
        membersError = `Every teammate must use their ${campus} student email (@${suffix}).`;
        return;
      }
    }

    if (!name && !email && !gender) {
      return;
    }

    if (email) {
      if (!EMAIL_REGEX.test(email) || !isAllowedDomain(email) || !matchesCampusDomain(email, campus)) {
        membersError = `One or more teammate emails are not recognised for ${campus}.`;
        return;
      }
      if (seenEmails.has(email)) {
        membersError = 'Each teammate must have a unique college email address.';
        return;
      }
      seenEmails.add(email);
    }

    members.push({
      slot: index + 1,
      name: name || null,
      email: email || null,
      gender: gender || null,
    });
  });

  if (membersError) {
    return { status: 400, error: membersError };
  }

  if (members.length !== teamSize - 1) {
    return { status: 400, error: 'Team size selection does not match submitted member details.' };
  }

  if (members.length > MAX_MEMBERS) {
    return { status: 400, error: 'A maximum of four teammates can be submitted alongside the leader.' };
  }

  const emails = Array.from(seenEmails);

  const record = {
    teamName,
    teamSize,
    campus,
    batch,
    lead: {
      name: leadName,
      email: leadEmail,
      gender: leadGender || null,
    },
    members,
    emails,
    submittedAt: serverTimestamp(),
  };

  return { status: 200, data: record };
};

const getWritableDataDir = () => {
  const preferredDir = path.join(process.cwd(), 'data');
  try {
    fs.mkdirSync(preferredDir, { recursive: true });
    return preferredDir;
  } catch (error) {
    if (error.code !== 'EROFS' && error.code !== 'EACCES') {
      throw error;
    }
  }

  const tempDir = path.join(os.tmpdir(), 'construct-registrations');
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
};

class DuplicateRegistrationError extends Error {
  constructor(email) {
    super(`A registration already exists for ${email}.`);
    this.name = 'DuplicateRegistrationError';
    this.email = email;
  }
}

const emailExistsInLocalList = (list, email) => list.some((entry) => Array.isArray(entry.emails) && entry.emails.includes(email));

const enforceUniqueEmails = async (emails, { db, localList }) => {
  for (const email of emails) {
    if (!email) continue;
    if (db) {
      const snapshot = await db.collection('teamRegistrations').where('emails', 'array-contains', email).limit(1).get();
      if (!snapshot.empty) {
        throw new DuplicateRegistrationError(email);
      }
    } else if (localList && emailExistsInLocalList(localList, email)) {
      throw new DuplicateRegistrationError(email);
    }
  }
};

const saveTeamRegistration = async (teamPayload) => {
  if (adminAvailable()) {
    const db = getDb();
    await enforceUniqueEmails(teamPayload.emails || [], { db });
    await db.collection('teamRegistrations').add(teamPayload);
    return;
  }

  // Fallback: persist to a local JSON file for testing when Firestore is not available.
  const dataDir = getWritableDataDir();

  const filePath = path.join(dataDir, 'local-registrations.json');
  const nowIso = new Date().toISOString();

  // Ensure submittedAt is a stable ISO string for the local fallback
  const entry = Object.assign({}, teamPayload, {
    submittedAt: nowIso,
    _localSavedAt: nowIso,
    _id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });

  let list = [];
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8') || '[]';
      list = JSON.parse(raw);
    }
  } catch (e) {
    // ignore parse errors and overwrite
    list = [];
  }

  await enforceUniqueEmails(teamPayload.emails || [], { localList: list });

  list.unshift(entry);
  try {
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
  } catch (error) {
    console.error('Local registration save failed', error);
    throw new Error('Registration storage is not configured. Provide Firebase credentials.');
  }
};

const listTeamRegistrations = async ({ limit = 100 } = {}) => {
  if (!adminAvailable()) {
    // Read from local fallback file if Firestore isn't configured.
    const candidates = [
      path.join(process.cwd(), 'data', 'local-registrations.json'),
      path.join(os.tmpdir(), 'construct-registrations', 'local-registrations.json'),
    ];
    try {
      const filePath = candidates.find((candidate) => fs.existsSync(candidate));
      if (!filePath) return [];
      const raw = fs.readFileSync(filePath, 'utf8') || '[]';
      const list = JSON.parse(raw);
      return list
        .slice(0, Math.min(list.length, Number.parseInt(limit, 10) || 100))
        .map(({ emails, ...rest }) => rest);
    } catch (e) {
      return [];
    }
  }

  const db = getDb();
  let query = db.collection('teamRegistrations').orderBy('submittedAt', 'desc');

  const numericLimit = Number.parseInt(limit, 10);
  if (!Number.isNaN(numericLimit) && numericLimit > 0) {
    query = query.limit(Math.min(numericLimit, 500));
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const submittedAt = data.submittedAt && typeof data.submittedAt.toDate === 'function'
      ? data.submittedAt.toDate().toISOString()
      : null;

    const { emails, ...rest } = data;

    return {
      id: doc.id,
      ...rest,
      submittedAt,
    };
  });
};

module.exports = {
  validateTeamPayload,
  saveTeamRegistration,
  listTeamRegistrations,
};
