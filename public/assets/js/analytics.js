// Privacy-first analytics stub. Replace with Plausible/Fathom/your provider integration.
export function trackEvent(name, data = {}) {
  if (typeof window === 'undefined' || typeof name !== 'string') return;

  const url = '/api/_analytics';
  const payload = JSON.stringify({
    name,
    data,
    timestamp: Date.now(),
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    if (navigator.sendBeacon(url, blob)) {
      return;
    }
  }

  if (window.fetch) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Swallow errors; analytics should never break UX
    });
  }
}

// Auto-pageview
(() => {
  if (typeof document === 'undefined') return;
  trackEvent('pageview', { path: location.pathname });
})();
