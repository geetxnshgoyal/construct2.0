const { validateSubmissionAccess } = require('../services/submissionAccessRegistry');

module.exports = async function submitAccess(req, res, next) {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const leadEmail = typeof payload.leadEmail === 'string' ? payload.leadEmail : '';
    const result = await validateSubmissionAccess({
      leadEmail,
      accessCode: typeof payload.accessCode === 'string' ? payload.accessCode : '',
      accessCodeHash: typeof payload.accessCodeHash === 'string' ? payload.accessCodeHash : '',
    });

    if (result.status !== 200) {
      res.status(result.status).json({ error: result.error || 'Submission access denied.' });
      return;
    }

    try {
      delete req.body.accessCode;
      delete req.body.accessCodeHash;
    } catch (cleanupError) {
      // ignore cleanup issues
    }

    req.submitAccess = {
      accessHash: result.data.hash,
      registration: result.data.registration,
    };

    // Ensure downstream handlers see the normalized lead email
    if (result.data.registration?.lead?.email) {
      req.body.leadEmail = result.data.registration.lead.email;
    }

    next();
  } catch (error) {
    console.error('Submission access validation failed', error);
    res.status(500).json({ error: 'Unable to verify submission access right now.' });
  }
};
