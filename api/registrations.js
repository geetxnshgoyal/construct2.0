const { validateTeamPayload, saveTeamRegistration, listTeamRegistrations } = require('../server/services/teamRegistrations');
const { notifyTeamRegistration } = require('../server/services/email');
const { initAdmin } = require('../server/firebaseAdmin');
const { Buffer } = require('buffer');

let adminReady = false;

const ensureAdmin = () => {
  if (adminReady) {
    return;
  }
  try {
    initAdmin();
    adminReady = true;
  } catch (error) {
    console.warn('Firebase Admin init failed in serverless context:', error.message);
  }
};

const checkBasicAuth = (req) => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return { ok: false, status: 500, message: 'Admin access is not configured.' };
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Basic ')) {
    return { ok: false, status: 401, message: 'Authentication required.' };
  }

  let decoded = '';
  try {
    decoded = Buffer.from(header.replace('Basic ', ''), 'base64').toString('utf8');
  } catch (_) {
    return { ok: false, status: 401, message: 'Authentication required.' };
  }

  const [user, pass] = decoded.split(':');

  if (user === username && pass === password) {
    return { ok: true };
  }

  return { ok: false, status: 401, message: 'Invalid credentials.' };
};

module.exports = async (req, res) => {
  ensureAdmin();

  if (req.method === 'POST') {
    const { status, error, data } = validateTeamPayload(req.body);

    if (error) {
      res.status(status).json({ error });
      return;
    }

    try {
      await saveTeamRegistration(data);
    } catch (err) {
      if (err?.name === 'DuplicateRegistrationError') {
        res.status(409).json({ error: err.message });
        return;
      }
      console.error('Serverless write error', err);
      res.status(500).json({ error: 'Failed to save submission' });
      return;
    }

    const emailPayload = { ...data, submittedAt: new Date().toISOString() };
    try {
      await notifyTeamRegistration(emailPayload);
    } catch (error) {
      console.error('Registration saved but failed to send notification email', error);
    }
    res.status(201).json({ ok: true });
    return;
  }

  if (req.method === 'GET') {
    const auth = checkBasicAuth(req);
    if (!auth.ok) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Construct Admin"');
      res.status(auth.status).send(auth.message);
      return;
    }

    try {
      const limit = req.query?.limit;
      const items = await listTeamRegistrations({ limit });
      res.status(200).json({ items });
    } catch (err) {
      console.error('Serverless list error', err);
      res.status(500).json({ error: 'Failed to load registrations' });
    }
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
};
