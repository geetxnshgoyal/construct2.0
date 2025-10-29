const express = require('express');
const { validateTeamPayload, saveTeamRegistration, listTeamRegistrations } = require('../services/teamRegistrations');
const adminAuth = require('../middleware/adminAuth');
const submissionGuard = require('../middleware/submissionGuard');
const recaptchaGuard = require('../middleware/recaptcha');
const participantAuth = require('../middleware/participantAuth');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const submitHandler = asyncHandler(async (req, res) => {
  const { status, error, data } = validateTeamPayload(req.body);

  if (error) {
    res.status(status).json({ error });
    return;
  }

  const participant = req.participant || null;
  const record = participant
    ? {
        ...data,
        submittedBy: {
          login: participant.login,
          name: participant.name,
          profileUrl: participant.profileUrl,
          avatarUrl: participant.avatarUrl,
          id: participant.id,
        },
      }
    : data;

  await saveTeamRegistration(record);
  res.status(201).json({ ok: true });
});

router.post('/registrations', participantAuth, submissionGuard, recaptchaGuard, submitHandler);
router.post('/submit', participantAuth, submissionGuard, recaptchaGuard, submitHandler);
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
