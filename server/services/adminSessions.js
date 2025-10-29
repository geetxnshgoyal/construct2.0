const crypto = require('crypto');

const SESSION_COOKIE_NAME = process.env.ADMIN_SESSION_COOKIE_NAME || 'construct_admin_session';
const DEFAULT_TTL_MS = Number.parseInt(process.env.ADMIN_SESSION_TTL_MS || String(12 * 60 * 60 * 1000), 10);
const SESSION_TTL_MS = Number.isNaN(DEFAULT_TTL_MS) ? 12 * 60 * 60 * 1000 : DEFAULT_TTL_MS;

const secureCookiesDefault = process.env.NODE_ENV === 'production';
const secureCookies = process.env.ADMIN_SESSION_COOKIE_SECURE
  ? process.env.ADMIN_SESSION_COOKIE_SECURE.toLowerCase() === 'true'
  : secureCookiesDefault;

const sessions = new Map();

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: secureCookies,
  maxAge: SESSION_TTL_MS,
  path: '/',
});

const cleanupExpired = () => {
  const now = Date.now();
  for (const [token, entry] of sessions.entries()) {
    if (now - entry.createdAt > SESSION_TTL_MS) {
      sessions.delete(token);
    }
  }
};

const createSession = (user) => {
  cleanupExpired();
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { user, createdAt: Date.now() });
  return token;
};

const getSession = (token) => {
  if (!token) return null;
  cleanupExpired();
  const entry = sessions.get(token);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  return entry;
};

const destroySession = (token) => {
  if (!token) return;
  sessions.delete(token);
};

const getSessionFromRequest = (req) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) {
    return null;
  }
  const entry = getSession(token);
  if (!entry) {
    return null;
  }
  req.adminUser = entry.user;
  return entry;
};

const attachSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE_NAME, token, getCookieOptions());
};

const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { ...getCookieOptions(), maxAge: 0 });
};

module.exports = {
  SESSION_COOKIE_NAME,
  createSession,
  destroySession,
  getSessionFromRequest,
  attachSessionCookie,
  clearSessionCookie,
  getSession,
};
