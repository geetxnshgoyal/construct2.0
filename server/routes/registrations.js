const express = require('express');
const {
  validateTeamPayload,
  saveTeamRegistration,
  listTeamRegistrations,
} = require('../services/teamRegistrations');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const submitHandler = asyncHandler(async (req, res) => {
  const { status, error, data } = validateTeamPayload(req.body);

  if (error) {
    res.status(status).json({ error });
    return;
  }

  await saveTeamRegistration(data);
  res.status(201).json({ ok: true });
});

router.post('/registrations', submitHandler);
router.post('/submit', submitHandler);
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
