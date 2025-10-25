import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type AnalyticsEvent = {
  name: string;
  path: string;
  ts: string;
};

const sendAnalyticsEvent = (event: AnalyticsEvent) => {
  const payload = JSON.stringify(event);
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon('/api/_analytics', payload);
    return;
  }
  fetch('/api/_analytics', {
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
