const { randomUUID } = require('crypto');

const WINDOW_MS = Number.parseInt(process.env.SUBMISSION_WINDOW_MS || '3600000', 10);
const MAX_PER_WINDOW = Number.parseInt(process.env.SUBMISSION_MAX_PER_WINDOW || '5', 10);
const MIN_INTERVAL_MS = Number.parseInt(process.env.SUBMISSION_MIN_INTERVAL_MS || '60000', 10);
const CLEANUP_INTERVAL_MS = Math.max(WINDOW_MS, 5 * 60 * 1000);

const submissions = new Map();
let lastCleanup = Date.now();

const cleanupStale = (now) => {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }
  for (const [key, entry] of submissions.entries()) {
    if (now - entry.firstSeen > WINDOW_MS) {
      submissions.delete(key);
    }
  }
  lastCleanup = now;
};

const getClientKey = (req) => {
  const forwarded =
    req.headers['x-forwarded-for'] ||
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || randomUUID();
};

module.exports = function submissionGuard(req, res, next) {
  const now = Date.now();
  cleanupStale(now);

  const clientKey = getClientKey(req);
  const entry = submissions.get(clientKey) || {
    firstSeen: now,
    lastAttempt: 0,
    attempts: 0,
  };

  if (now - entry.firstSeen > WINDOW_MS) {
    entry.firstSeen = now;
    entry.attempts = 0;
  }

  if (entry.lastAttempt && now - entry.lastAttempt < MIN_INTERVAL_MS) {
    res
      .status(429)
      .json({
        error: 'Too many submissions from this network. Please wait a minute before trying again.',
      });
    return;
  }

  if (entry.attempts >= MAX_PER_WINDOW) {
    res
      .status(429)
      .json({
        error: 'Registration request limit reached for this network. Try again later or contact the organizers.',
      });
    return;
  }

  entry.attempts += 1;
  entry.lastAttempt = now;
  submissions.set(clientKey, entry);

  next();
};
