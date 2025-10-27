import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type AnalyticsEvent = {
  name: string;
  path: string;
  ts: string;
};

const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT ?? '/api/_analytics';
const ANALYTICS_ENABLED = import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

const sendAnalyticsEvent = (event: AnalyticsEvent) => {
  if (!ANALYTICS_ENABLED) {
    return;
  }
  const payload = JSON.stringify(event);
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, payload);
    return;
  }
  fetch(ANALYTICS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true
  }).catch(() => {
    // Ignore network errors for analytics beacons.
  });
};

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    sendAnalyticsEvent({ name: 'page_view', path: location.pathname + location.hash, ts: new Date().toISOString() });
  }, [location.pathname, location.hash]);
};
