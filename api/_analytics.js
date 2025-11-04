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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
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
