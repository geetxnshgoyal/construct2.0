const { Buffer } = require('buffer');

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || '';

const challenge = (res, message = 'Authentication required.') => {
  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  res.status(401).send(message);
};

module.exports = (req, res, next) => {
  if (!password) {
    res.status(500).send('Admin access is not configured. Set ADMIN_PASSWORD in the server environment.');
    return;
  }

  const header = req.headers.authorization;

  if (!header || !header.startsWith('Basic ')) {
    challenge(res);
    return;
  }

  let decoded = '';
  try {
    decoded = Buffer.from(header.replace('Basic ', ''), 'base64').toString('utf8');
  } catch (error) {
    challenge(res);
    return;
  }

  const [user, pass] = decoded.split(':');

  if (user === username && pass === password) {
    next();
    return;
  }

  challenge(res, 'Invalid credentials.');
};
