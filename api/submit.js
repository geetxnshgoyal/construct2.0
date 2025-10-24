const { validateTeamPayload, saveTeamRegistration } = require('../server/services/teamRegistrations');

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
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error('Serverless write error', e);
    res.status(500).json({ error: 'Failed to save submission', details: process.env.NODE_ENV === 'production' ? undefined : e.message });
  }
};
