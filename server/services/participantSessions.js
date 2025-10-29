const crypto = require('crypto');

const SESSION_COOKIE_NAME = process.env.PARTICIPANT_SESSION_COOKIE_NAME || 'construct_user_session';
const DEFAULT_TTL_MS = Number.parseInt(process.env.PARTICIPANT_SESSION_TTL_MS || String(6 * 60 * 60 * 1000), 10);
const SESSION_TTL_MS = Number.isNaN(DEFAULT_TTL_MS) ? 6 * 60 * 60 * 1000 : DEFAULT_TTL_MS;

const secureCookiesDefault = process.env.NODE_ENV === 'production';
const secureCookies = process.env.PARTICIPANT_SESSION_COOKIE_SECURE
  ? process.env.PARTICIPANT_SESSION_COOKIE_SECURE.toLowerCase() === 'true'
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

const attachSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE_NAME, token, getCookieOptions());
};

const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { ...getCookieOptions(), maxAge: 0 });
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
  req.participant = entry.user;
  return entry;
};

module.exports = {
  SESSION_COOKIE_NAME,
  createSession,
  destroySession,
  attachSessionCookie,
  clearSessionCookie,
  getSessionFromRequest,
};
