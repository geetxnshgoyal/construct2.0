const fs = require('fs');
const os = require('os');
const path = require('path');
const { getDb, serverTimestamp, adminAvailable } = require('../firebaseAdmin');

const EDU_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.edu\.in$/i;
const BLOCKED_EMAIL_DOMAINS = new Set(['test.edu.in']);
const MIN_TEAM_SIZE = 1;
const MAX_TEAM_SIZE = 5;
const MAX_MEMBERS = MAX_TEAM_SIZE - 1;

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

const isBlockedDomain = (email) => {
  const [, domain = ''] = email.split('@');
  return BLOCKED_EMAIL_DOMAINS.has(domain);
};

const validateTeamPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { status: 400, error: 'Invalid request body. Expected a JSON object.' };
  }

  const teamName = sanitizeString(payload.teamName);
  const teamSizeRaw = sanitizeString(payload.teamSize);
  const teamSize = Number.parseInt(teamSizeRaw, 10);
  const honeypot = sanitizeString(payload.honeypot || payload.website || payload.phone || payload.url);

  if (honeypot) {
    return { status: 400, error: 'Submission failed verification. Please contact the organizers if this persists.' };
  }

  if (!teamName) {
    return { status: 400, error: 'Team name is required.' };
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

  if (!EDU_EMAIL_REGEX.test(leadEmail)) {
    return { status: 400, error: 'Team lead email must be a valid college email ending with .edu.in.' };
  }

  if (isBlockedDomain(leadEmail)) {
    return { status: 400, error: 'Registrations from this email domain are not permitted. Use your official college email.' };
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
      if (!EDU_EMAIL_REGEX.test(email)) {
        membersError = 'Provide valid college emails ending with .edu.in for every teammate you include.';
        return;
      }
    }

    if (!name && !email && !gender) {
      return;
    }

    if (email) {
      if (!EDU_EMAIL_REGEX.test(email)) {
        membersError = 'Team member emails must be valid college addresses ending with .edu.in.';
        return;
      }
      if (isBlockedDomain(email)) {
        membersError = 'One or more teammate email domains are not permitted. Use official college emails.';
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

  const record = {
    teamName,
    teamSize,
    lead: {
      name: leadName,
      email: leadEmail,
      gender: leadGender || null,
    },
    members,
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

const saveTeamRegistration = async (teamPayload) => {
  if (adminAvailable()) {
    const db = getDb();
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
      return list.slice(0, Math.min(list.length, Number.parseInt(limit, 10) || 100));
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

    return {
      id: doc.id,
      ...data,
      submittedAt,
    };
  });
};

module.exports = {
  validateTeamPayload,
  saveTeamRegistration,
  listTeamRegistrations,
};
