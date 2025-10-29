const express = require('express');
const { callFetch } = require('../utils/http');
const {
  createSession,
  destroySession,
  attachSessionCookie,
  clearSessionCookie,
  getSessionFromRequest,
  SESSION_COOKIE_NAME,
} = require('../services/adminSessions');
const {
  createSession: createParticipantSession,
  destroySession: destroyParticipantSession,
  attachSessionCookie: attachParticipantCookie,
  clearSessionCookie: clearParticipantCookie,
  getSessionFromRequest: getParticipantSessionFromRequest,
  SESSION_COOKIE_NAME: PARTICIPANT_SESSION_COOKIE_NAME,
} = require('../services/participantSessions');
const {
  generateState,
  verifyAndConsumeState,
  STATE_COOKIE_NAME,
  getCookieOptions: getStateCookieOptions,
} = require('../services/githubStateStore');

const router = express.Router();

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const githubRedirectBase = process.env.GITHUB_CALLBACK_URL;
const allowedUsersEnv = process.env.GITHUB_ALLOWED_USERS || '';
const allowedUsers = allowedUsersEnv
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const isGitHubConfigured = Boolean(githubClientId && githubClientSecret);

const resolveMode = (value) => (value === 'participant' ? 'participant' : 'admin');

const resolveCallbackUrl = (req) => {
  if (githubRedirectBase) {
    return githubRedirectBase;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}/api/auth/github/callback`;
};

const fetchGitHubToken = async ({ code, redirectUri }) => {
  const params = new URLSearchParams();
  params.set('client_id', githubClientId);
  params.set('client_secret', githubClientSecret);
  params.set('code', code);
  if (redirectUri) {
    params.set('redirect_uri', redirectUri);
  }

  const response = await callFetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error_description || `GitHub token exchange failed: ${payload.error}`);
  }

  if (!payload.access_token) {
    throw new Error('GitHub token exchange did not return an access token.');
  }

  return payload.access_token;
};

const fetchGitHubUser = async (accessToken) => {
  const response = await callFetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'construct-admin-console',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub user fetch failed with status ${response.status}`);
  }

  return response.json();
};

router.get('/session', (req, res) => {
  const session = getSessionFromRequest(req);
  const data = {
    authenticated: Boolean(session),
    user: session ? session.user : null,
    methods: {
      github: isGitHubConfigured,
      passcode: Boolean(process.env.ADMIN_PASSWORD),
    },
  };
  res.json(data);
});

router.post('/logout', (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  destroySession(token);
  clearSessionCookie(res);
  res.status(204).end();
});

router.get('/participant/session', (req, res) => {
  const session = getParticipantSessionFromRequest(req);
  res.json({
    authenticated: Boolean(session),
    user: session ? session.user : null,
    methods: {
      github: isGitHubConfigured,
    },
  });
});

router.post('/participant/logout', (req, res) => {
  const token = req.cookies?.[PARTICIPANT_SESSION_COOKIE_NAME];
  destroyParticipantSession(token);
  clearParticipantCookie(res);
  res.status(204).end();
});

router.get('/github/login', (req, res) => {
  if (!isGitHubConfigured) {
    res.status(503).json({ error: 'GitHub authentication is not configured.' });
    return;
  }

  const mode = resolveMode(req.query.mode);

  const state = generateState({ mode });
  res.cookie(STATE_COOKIE_NAME, state, getStateCookieOptions());

  const redirectUri = resolveCallbackUrl(req);
  const params = new URLSearchParams({
    client_id: githubClientId,
    state,
    allow_signup: 'false',
  });

  const scope = process.env.GITHUB_OAUTH_SCOPE || 'read:user';
  if (scope) {
    params.set('scope', scope);
  }

  params.set('redirect_uri', redirectUri);

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

router.get('/github/callback', async (req, res) => {
  if (!isGitHubConfigured) {
    res.status(503).send('GitHub authentication is not configured.');
    return;
  }

  const { code, state } = req.query;
  const stateCookie = req.cookies?.[STATE_COOKIE_NAME];

  if (!code || typeof code !== 'string') {
    res.status(400).send('Missing OAuth code.');
    return;
  }

  const stateData = state && state === stateCookie ? verifyAndConsumeState(state) : null;
  if (!stateData) {
    res.status(400).send('State verification failed.');
    return;
  }

  try {
    const redirectUri = resolveCallbackUrl(req);
    const accessToken = await fetchGitHubToken({ code, redirectUri });
    const profile = await fetchGitHubUser(accessToken);

    if (!profile || !profile.login) {
      throw new Error('GitHub profile did not include a login.');
    }

    const mode = resolveMode(stateData.mode);

    const normalizedLogin = profile.login.toLowerCase();
    if (mode === 'admin' && allowedUsers.length > 0 && !allowedUsers.includes(normalizedLogin)) {
      res.status(403).send('Access denied.');
      return;
    }

    const userPayload = {
      login: profile.login,
      name: profile.name || null,
      avatarUrl: profile.avatar_url || null,
      profileUrl: profile.html_url || null,
      id: profile.id || null,
    };

    if (mode === 'admin') {
      const sessionToken = createSession(userPayload);
      attachSessionCookie(res, sessionToken);
    } else {
      const sessionToken = createParticipantSession(userPayload);
      attachParticipantCookie(res, sessionToken);
    }

    res.clearCookie(STATE_COOKIE_NAME, { ...getStateCookieOptions(), maxAge: 0 });

    const redirectTarget = mode === 'admin'
      ? process.env.ADMIN_LOGIN_REDIRECT || '/admin'
      : process.env.REGISTRATION_LOGIN_REDIRECT || '/register';
    res.redirect(redirectTarget);
  } catch (error) {
    console.error('GitHub OAuth callback failed', error);
    res.status(500).send('Authentication failed. Please try again.');
  }
});

module.exports = router;
