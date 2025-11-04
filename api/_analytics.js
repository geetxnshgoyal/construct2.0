const safeParse = (payload) => {
  if (!payload) {
    return {};
  }

  if (typeof payload === 'object') {
    return payload;
  }

  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch {
      return { raw: payload };
    }
  }

  return {};
};

module.exports = (req, res) => {
  res.setHeader('Allow', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const event = safeParse(req.body);
  const eventName = typeof event.name === 'string' ? event.name : 'unknown';

  console.log('Analytics event received', {
    name: eventName,
    path: event.path,
    ts: event.ts
  });

  res.status(204).end();
};
