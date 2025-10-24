const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

let dbInstance = null;

const parseServiceAccountString = (raw) => {
  if (!raw) return null;

  try {
    if (raw.trim().startsWith('{')) {
      return JSON.parse(raw);
    }
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Could not parse FIREBASE_SERVICE_ACCOUNT as JSON');
  }
};

const readServiceAccountFromFile = (filePath) => {
  if (!filePath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is required when FIREBASE_SERVICE_ACCOUNT is not provided.');
  }

  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Firebase service account file not found at ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Firebase service account file is not valid JSON: ${resolvedPath}`);
  }
};

const loadServiceAccount = () => {
  const fromEnv = parseServiceAccountString(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (fromEnv) return fromEnv;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH before starting the server.');
  }

  return readServiceAccountFromFile(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
};

function initAdmin() {
  if (admin.apps && admin.apps.length) return admin.app();

  const serviceAccount = loadServiceAccount();

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

function getDb() {
  if (!dbInstance) {
    const app = initAdmin();
    dbInstance = app.firestore();
  }
  return dbInstance;
}

const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

module.exports = {
  initAdmin,
  getDb,
  serverTimestamp,
  admin,
};
