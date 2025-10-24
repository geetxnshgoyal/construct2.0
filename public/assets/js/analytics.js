// Privacy-first analytics stub. Replace with Plausible/Fathom/your provider integration.
const analyticsEndpoint = (() => {
  if (typeof window === 'undefined') return null;
  if (window.__ENABLE_ANALYTICS !== true) return null;
  const override = typeof window.__ANALYTICS_ENDPOINT === 'string' ? window.__ANALYTICS_ENDPOINT.trim() : '';
  if (override) return override;
  const meta = document.querySelector('meta[name="analytics:endpoint"]');
  if (meta && typeof meta.content === 'string') {
    const value = meta.content.trim();
    if (value) return value;
  }
  return null;
})();

export function trackEvent(name, data = {}) {
  if (typeof window === 'undefined' || typeof name !== 'string' || !analyticsEndpoint) return;

  const url = analyticsEndpoint;
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
  if (typeof document === 'undefined' || !analyticsEndpoint) return;
  trackEvent('pageview', { path: location.pathname });
})();
