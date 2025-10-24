const { Buffer } = require('buffer');

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || '';

const respondUnauthorized = (res, message = 'Authentication required.') => {
  res.status(401).json({ error: message });
};

module.exports = (req, res, next) => {
  if (!password) {
    res.status(500).json({ error: 'Admin access is not configured. Set ADMIN_PASSWORD in the server environment.' });
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
