const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const registrationsRouter = require('./routes/registrations');
const { initAdmin } = require('./firebaseAdmin');

try {
  initAdmin();
  console.log('Firebase Admin SDK initialised.');
} catch (error) {
  console.warn('Firebase Admin SDK not initialised yet:', error.message);
}

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
      : undefined,
  })
);
app.use(express.json({ limit: '1mb' }));

const maxRequests = Number.parseInt(process.env.API_RATE_LIMIT_MAX || '60', 10);
const requestsPerWindow = Number.isNaN(maxRequests) ? 60 : maxRequests;

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: requestsPerWindow,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const publicDir = path.join(__dirname, '..', 'public');

app.get(['/admin', '/admin/', '/admin.html'], (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.use(express.static(publicDir));

app.use('/api', registrationsRouter);

app.post('/api/_analytics', (req, res) => {
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  console.log('Analytics event', payload.name || 'unknown');
  res.status(204).end();
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  const status = err.status || err.statusCode || 500;
  const message = status >= 500 ? 'Internal server error' : err.message || 'Request failed';
  res.status(status).json({ error: message });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const host = process.env.HOST || '0.0.0.0';
const preferredPort = Number.parseInt(process.env.PORT || '3001', 10);

const startServer = (portToUse, { attemptedFallback = false } = {}) => {
  let server;
  try {
    server = app.listen(portToUse, host, () => {
      const address = server.address();
      const actualPort = address && typeof address === 'object' ? address.port : portToUse;
      console.log(`Server listening on http://${host}:${actualPort}`);
      if (attemptedFallback && portToUse === 0) {
        console.warn(`Using fallback port ${actualPort}. Update the PORT environment variable if you want a fixed port.`);
      }
    });
  } catch (err) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      console.warn('Missing permission to bind server socket in this environment. Skipping server start.');
      return;
    }
    throw err;
  }

  server.on('error', (err) => {
    if ((err.code === 'EADDRINUSE') && !attemptedFallback) {
      console.warn(`Port ${portToUse} is already in use. Trying an ephemeral port instead…`);
      startServer(0, { attemptedFallback: true });
      return;
    }

    if (err.code === 'EACCES' || err.code === 'EPERM') {
      console.warn('Missing permission to bind server socket in this environment. Skipping server start.');
      return;
    }

    console.error('Failed to start server:', err);
    process.exit(1);
  });
};

startServer(preferredPort);
