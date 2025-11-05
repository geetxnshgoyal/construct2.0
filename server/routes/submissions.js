const express = require('express');
const submissionGuard = require('../middleware/submissionGuard');
const submitAccess = require('../middleware/submitAccess');
const adminAuth = require('../middleware/adminAuth');
const {
  validateTeamSubmission,
  saveTeamSubmission,
  listTeamSubmissions,
} = require('../services/teamSubmissions');
const { validateSubmissionAccess } = require('../services/submissionAccessRegistry');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const submissionsClosed = () => {
  const closedFlag = process.env.SUBMISSION_CLOSED;
  if (typeof closedFlag === 'string' && closedFlag.toLowerCase() === 'true') {
    return true;
  }
  const openFlag = process.env.SUBMISSION_OPEN;
  if (typeof openFlag === 'string' && openFlag.toLowerCase() === 'false') {
    return true;
  }
  return false;
};

router.post(
  '/final-submissions/access',
  submissionGuard,
  asyncHandler(async (req, res) => {
    if (submissionsClosed()) {
      res.status(403).json({ error: 'Final submissions are closed.' });
      return;
    }

    const result = await validateSubmissionAccess({
      leadEmail: req.body?.leadEmail,
      accessCode: req.body?.accessCode,
      accessCodeHash: req.body?.accessCodeHash,
    });

    if (result.status !== 200) {
      res.status(result.status).json({ error: result.error || 'Access denied.' });
      return;
    }

    res.json({
      ok: true,
      teamName: result.data.registration?.teamName || null,
      leadEmail: result.data.registration?.lead?.email || req.body?.leadEmail || null,
      accessCodeHash: result.data.hash,
    });
  })
);

router.post(
  '/final-submissions',
  submissionGuard,
  submitAccess,
  asyncHandler(async (req, res) => {
    if (submissionsClosed()) {
      res.status(403).json({ error: 'Final submissions are closed.' });
      return;
    }

    const { status, data, error } = validateTeamSubmission(req.body, {
      registration: req.submitAccess?.registration || null,
      accessHash: req.submitAccess?.accessHash || null,
    });
    if (error) {
      res.status(status).json({ error });
      return;
    }

    await saveTeamSubmission(data);

    res.status(201).json({ ok: true });
  })
);

router.get(
  '/final-submissions',
  adminAuth,
  asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const items = await listTeamSubmissions({ limit });
    res.json({ items });
  })
);

module.exports = router;
