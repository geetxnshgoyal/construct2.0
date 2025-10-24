// Mock server to test /api/submit flow without Firestore
// It uses existing validation from server/services/teamRegistrations.js
// and writes accepted payloads to scripts/mock-registrations.json

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const { validateTeamPayload, saveTeamRegistration } = require('../server/services/teamRegistrations');

// We'll override saveTeamRegistration to write to a local file instead of Firestore
const saveToLocal = async (teamPayload) => {
  const outPath = path.join(__dirname, 'mock-registrations.json');
  let arr = [];
  try {
    if (fs.existsSync(outPath)) {
      const raw = fs.readFileSync(outPath, 'utf8');
      arr = JSON.parse(raw || '[]');
    }
  } catch (e) {
    console.warn('Could not read mock file, starting fresh');
    arr = [];
  }

  // Add an id and timestamp
  const record = {
    id: `mock-${Date.now()}`,
    ...teamPayload,
    savedAt: new Date().toISOString(),
  };

  arr.push(record);
  fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), 'utf8');
  return record;
};

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

app.post('/api/submit', async (req, res) => {
  const { status, error, data } = validateTeamPayload(req.body);
  if (error) {
    res.status(status).json({ error });
    return;
  }

  try {
    const saved = await saveToLocal(data);
    res.status(201).json({ ok: true, id: saved.id });
  } catch (e) {
    console.error('Mock save error', e);
    res.status(500).json({ error: 'Mock save failed', details: e.message });
  }
});

const port = process.env.MOCK_PORT || 4000;
app.listen(port, () => console.log(`Mock server listening on http://localhost:${port}`));
