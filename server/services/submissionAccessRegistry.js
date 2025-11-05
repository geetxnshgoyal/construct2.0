const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { adminAvailable, getDb } = require('../firebaseAdmin');
const { findTeamRegistrationByLeadEmail } = require('./teamRegistrations');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const LOCAL_ACCESS_PATH =
  process.env.SUBMISSION_ACCESS_FILE || path.join(process.cwd(), 'data', 'submission-access.json');

const hashString = (value) => crypto.createHash('sha256').update(String(value || '').trim()).digest('hex');

const loadLocalAccessEntries = () => {
  if (!fs.existsSync(LOCAL_ACCESS_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(LOCAL_ACCESS_PATH, 'utf8') || '[]';
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn('Failed to parse submission access file:', error.message);
    return [];
  }
};

const refreshLocalAccessCache = () => {
  return loadLocalAccessEntries();
};

const ensureHash = (entry) => {
  if (!entry) return null;
  if (entry.hash) {
    return String(entry.hash).trim().toLowerCase();
  }
  if (entry.accessCodeHash) {
    return String(entry.accessCodeHash).trim().toLowerCase();
  }
  if (entry.code) {
    return hashString(entry.code);
  }
  if (entry.passcode) {
    return hashString(entry.passcode);
  }
  return null;
};

const findAccessEntry = async (leadEmail) => {
  const normalized = normalizeEmail(leadEmail);
  if (!normalized) {
    return null;
  }

  if (adminAvailable()) {
    const db = getDb();
    const doc = await db.collection('submissionAccessKeys').doc(normalized).get();
    if (doc.exists) {
      return doc.data();
    }
  }

  const entries = loadLocalAccessEntries();
  return entries.find((entry) => normalizeEmail(entry.leadEmail) === normalized) || null;
};

const validateSubmissionAccess = async ({ leadEmail, accessCode, accessCodeHash }) => {
  const normalizedEmail = normalizeEmail(leadEmail);
  if (!normalizedEmail) {
    return { status: 400, error: 'Lead email is required.' };
  }

  // Find the registration
  const registration = await findTeamRegistrationByLeadEmail(normalizedEmail);
  if (!registration) {
    return { status: 404, error: 'Lead email not found in registrations. Contact the organisers.' };
  }

  // Check if the registration has a submission access code hash
  let expectedHash = registration.submissionAccessCodeHash;
  
  // If not in registration (legacy), fall back to separate access entry
  if (!expectedHash) {
    const entry = await findAccessEntry(normalizedEmail);
    if (!entry) {
      return { status: 401, error: 'Submission code not assigned for this team. Reach out to the ops desk.' };
    }
    expectedHash = ensureHash(entry);
  }

  if (!expectedHash) {
    return {
      status: 503,
      error: 'Submission access configuration missing hash. Contact the engineering team.',
    };
  }

  // Normalize expected hash
  expectedHash = String(expectedHash).trim().toLowerCase();

  // Get provided hash
  const providedHash = accessCodeHash
    ? String(accessCodeHash).trim().toLowerCase()
    : accessCode
    ? hashString(accessCode)
    : '';

  if (!providedHash) {
    return { status: 400, error: 'Submission code is required.' };
  }

  // Validate the hash
  if (providedHash !== expectedHash) {
    return { status: 401, error: 'Submission code invalid for this team. Double-check the passcode email.' };
  }

  // Return successful validation with registration data
  const enrichedRegistration = Object.assign({}, registration);
  if (enrichedRegistration.lead && typeof enrichedRegistration.lead === 'object') {
    enrichedRegistration.lead = Object.assign({}, enrichedRegistration.lead, {
      email: enrichedRegistration.lead.email
        ? normalizeEmail(enrichedRegistration.lead.email)
        : null,
    });
  }

  return {
    status: 200,
    data: {
      hash: expectedHash,
      registration: enrichedRegistration,
    },
  };
};

module.exports = {
  validateSubmissionAccess,
  refreshLocalAccessCache,
};
