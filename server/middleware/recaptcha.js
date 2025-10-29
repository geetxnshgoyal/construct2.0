const { callFetch } = require('../utils/http');

const DEFAULT_MIN_SCORE = Number.parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

const shouldVerify = Boolean(RECAPTCHA_SECRET);

const postToRecaptcha = async ({ token, remoteIp }) => {
  const params = new URLSearchParams();
  params.append('secret', RECAPTCHA_SECRET);
  params.append('response', token);
  if (remoteIp) {
    params.append('remoteip', remoteIp);
  }

  const response = await callFetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`reCAPTCHA verification failed with status ${response.status}`);
  }

  return response.json();
};

const normalizeIp = (value) => {
  if (!value) return null;
  if (value.includes(',')) {
    return value.split(',')[0].trim();
  }
  if (value.startsWith('::ffff:')) {
    return value.slice('::ffff:'.length);
  }
  return value;
};

module.exports = async function recaptchaGuard(req, res, next) {
  if (!shouldVerify) {
    next();
    return;
  }

  const token = req.body?.recaptchaToken;
  if (!token || typeof token !== 'string' || !token.trim()) {
    res.status(400).json({ error: 'Verification failed. Refresh and try again.' });
    return;
  }

  try {
    const payload = await postToRecaptcha({
      token: token.trim(),
      remoteIp:
        req.headers['x-forwarded-for'] ||
        req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        normalizeIp(req.ip),
    });

    if (!payload.success) {
      res.status(400).json({ error: 'Verification failed. Please try again.' });
      return;
    }

    if (typeof payload.score === 'number' && payload.score < DEFAULT_MIN_SCORE) {
      res
        .status(400)
        .json({ error: 'Verification score too low. Refresh the page and try again.' });
      return;
    }

    if (payload.action && payload.action !== 'registration') {
      res.status(400).json({ error: 'Verification mismatch. Please try again.' });
      return;
    }

    delete req.body.recaptchaToken;

    next();
  } catch (error) {
    console.error('reCAPTCHA verification error', error);
    res.status(400).json({ error: 'Verification failed. Please try again.' });
  }
};
