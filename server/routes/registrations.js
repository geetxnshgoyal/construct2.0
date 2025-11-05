const express = require('express');
const { validateTeamPayload, saveTeamRegistration, listTeamRegistrations } = require('../services/teamRegistrations');
const { notifyTeamRegistration } = require('../services/email');
const adminAuth = require('../middleware/adminAuth');
const submissionGuard = require('../middleware/submissionGuard');
const recaptchaGuard = require('../middleware/recaptcha');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const registrationsClosed = () => {
  const closedFlag = process.env.REGISTRATION_CLOSED;
  if (typeof closedFlag === 'string' && closedFlag.toLowerCase() === 'true') {
    return true;
  }
  const openFlag = process.env.REGISTRATION_OPEN;
  if (typeof openFlag === 'string' && openFlag.toLowerCase() === 'false') {
    return true;
  }
  return false;
};

const submitHandler = asyncHandler(async (req, res) => {
  if (registrationsClosed()) {
    res.status(403).json({ error: 'Registrations are closed.' });
    return;
  }

  const { status, error, data } = validateTeamPayload(req.body);

  if (error) {
    res.status(status).json({ error });
    return;
  }

  try {
    await saveTeamRegistration(data);
  } catch (error) {
    if (error?.name === 'DuplicateRegistrationError') {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }

  const emailPayload = { ...data, submittedAt: new Date().toISOString() };
  notifyTeamRegistration(emailPayload).catch((error) => {
    console.error('Registration saved but failed to send notification email', error);
  });
  res.status(201).json({ ok: true });
});

router.post('/registrations', submissionGuard, recaptchaGuard, submitHandler);
router.post('/submit', submissionGuard, recaptchaGuard, submitHandler);
router.get(
  '/registrations',
  adminAuth,
  asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const items = await listTeamRegistrations({ limit });
    res.json({ items });
  })
);

module.exports = router;
