const crypto = require('crypto');

const STATE_COOKIE_NAME = process.env.GITHUB_STATE_COOKIE_NAME || 'construct_github_state';
const DEFAULT_TTL_MS = Number.parseInt(process.env.GITHUB_STATE_TTL_MS || String(10 * 60 * 1000), 10);
const STATE_TTL_MS = Number.isNaN(DEFAULT_TTL_MS) ? 10 * 60 * 1000 : DEFAULT_TTL_MS;

const secureCookiesDefault = process.env.NODE_ENV === 'production';
const secureCookies = process.env.GITHUB_STATE_COOKIE_SECURE
  ? process.env.GITHUB_STATE_COOKIE_SECURE.toLowerCase() === 'true'
  : secureCookiesDefault;

const states = new Map();

const cleanupExpired = () => {
  const now = Date.now();
  for (const [value, createdAt] of states.entries()) {
    if (now - createdAt > STATE_TTL_MS) {
      states.delete(value);
    }
  }
};

const generateState = (data = {}) => {
  cleanupExpired();
  const value = crypto.randomBytes(16).toString('hex');
  states.set(value, { createdAt: Date.now(), data });
  return value;
};

const verifyAndConsumeState = (value) => {
  if (!value) {
    return null;
  }
  cleanupExpired();
  const entry = states.get(value);
  if (!entry) {
    return null;
  }

  states.delete(value);
  if (Date.now() - entry.createdAt > STATE_TTL_MS) {
    return null;
  }

  return entry.data || {};
};

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: secureCookies,
  maxAge: STATE_TTL_MS,
  path: '/api/auth/github',
});

module.exports = {
  STATE_COOKIE_NAME,
  generateState,
  verifyAndConsumeState,
  getCookieOptions,
};
