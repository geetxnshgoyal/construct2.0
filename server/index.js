const buildApp = require('./app');

const app = buildApp();

const host = process.env.HOST || '0.0.0.0';
const preferredPort = Number.parseInt(process.env.PORT || '3001', 10);

const startServer = (portToUse, { attemptedFallback = false } = {}) => {
  let server;
  try {
    server = app.listen(portToUse, host, () => {
      const address = server.address();
      const actualPort = address && typeof address === 'object' ? address.port : portToUse;
      // If binding to 0.0.0.0, display localhost for developer-friendly logs.
      const displayHost = host === '0.0.0.0' ? 'localhost' : host;
      console.log(`Server listening on http://${displayHost}:${actualPort}`);
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
