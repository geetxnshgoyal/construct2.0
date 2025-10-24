const { getDb, serverTimestamp } = require('../firebaseAdmin');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MIN_TEAM_SIZE = 3;
const MAX_TEAM_SIZE = 5;
const MAX_MEMBERS = MAX_TEAM_SIZE - 1;

const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const validateTeamPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { status: 400, error: 'Invalid request body. Expected a JSON object.' };
  }

  const teamName = sanitizeString(payload.teamName);
  const teamSizeRaw = sanitizeString(payload.teamSize);
  const teamSize = Number.parseInt(teamSizeRaw, 10);

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
  const leadEmail = sanitizeString(leadInput.email).toLowerCase();
  const leadGender = sanitizeString(leadInput.gender);

  if (!leadName || !leadEmail || !leadGender) {
    return { status: 400, error: 'Team lead name, email, and gender are required.' };
  }

  if (!EMAIL_REGEX.test(leadEmail)) {
    return { status: 400, error: 'Team lead email must be a valid email address.' };
  }

  const membersRaw = Array.isArray(payload.members) ? payload.members : [];
  const members = [];
  let membersError = null;

  membersRaw.forEach((member, index) => {
    if (membersError || members.length >= MAX_MEMBERS) return;

    const name = sanitizeString(member.name);
    const email = sanitizeString(member.email).toLowerCase();
    const gender = sanitizeString(member.gender);
    const isRequired = index < (teamSize - 1);

    if (isRequired) {
      if (!name || !email || !gender) {
        membersError = 'Each submitted teammate must include name, college email, and gender.';
        return;
      }
      if (!EMAIL_REGEX.test(email)) {
        membersError = 'Provide valid college emails for every teammate you include.';
        return;
      }
    }

    if (!name && !email && !gender) {
      return;
    }

    if (email && !EMAIL_REGEX.test(email)) {
      membersError = 'Team member emails must be valid email addresses.';
      return;
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

  if (members.length < MIN_TEAM_SIZE - 1) {
    return { status: 400, error: 'Provide at least two teammates in addition to the team leader.' };
  }

  if (members.length > MAX_MEMBERS) {
    return { status: 400, error: 'A maximum of four teammates can be submitted alongside the leader.' };
  }

  const hasFemale =
    leadGender.toLowerCase() === 'female' ||
    members.some((member) => (member.gender || '').toLowerCase() === 'female');

  if (!hasFemale) {
    return { status: 400, error: 'At least one teammate must identify as female.' };
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

const saveTeamRegistration = async (teamPayload) => {
  const db = getDb();
  await db.collection('teamRegistrations').add(teamPayload);
};

const listTeamRegistrations = async ({ limit = 100 } = {}) => {
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
