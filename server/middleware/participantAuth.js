const { getSessionFromRequest } = require('../services/participantSessions');

module.exports = (req, res, next) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: 'Sign in with GitHub before submitting the registration form.' });
    return;
  }
  next();
};
