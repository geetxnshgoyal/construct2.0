const { Buffer } = require('buffer');
const {
  getSessionFromRequest,
} = require('../services/adminSessions');

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || '';

const respondUnauthorized = (res, message = 'Authentication required.') => {
  res.status(401).json({ error: message });
};

module.exports = (req, res, next) => {
  const session = getSessionFromRequest(req);
  if (session) {
    next();
    return;
  }

  if (!password) {
    res.status(401).json({ error: 'Admin session required.' });
    return;
  }

  const header = req.headers.authorization;

  if (!header || !header.startsWith('Basic ')) {
    respondUnauthorized(res);
    return;
  }

  let decoded = '';
  try {
    decoded = Buffer.from(header.replace('Basic ', ''), 'base64').toString('utf8');
  } catch (error) {
    respondUnauthorized(res);
    return;
  }

  const [user, pass] = decoded.split(':');

  if (user === username && pass === password) {
    next();
    return;
  }

  respondUnauthorized(res, 'Invalid credentials.');
};
