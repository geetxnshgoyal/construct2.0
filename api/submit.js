const { validateTeamPayload, saveTeamRegistration } = require('../server/services/teamRegistrations');
const { notifyTeamRegistration } = require('../server/services/email');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { status, error, data } = validateTeamPayload(req.body);

  if (error) {
    res.status(status).json({ error });
    return;
  }

  try {
    await saveTeamRegistration(data);
  } catch (e) {
    console.error('Serverless write error', e);
    res.status(500).json({ error: 'Failed to save submission', details: process.env.NODE_ENV === 'production' ? undefined : e.message });
    return;
  }

  const emailPayload = { ...data, submittedAt: new Date().toISOString() };
  try {
    await notifyTeamRegistration(emailPayload);
  } catch (error) {
    console.error('Registration saved but failed to send notification email', error);
  }
  res.status(201).json({ ok: true });
};
