import { useEffect } from 'react';

const clearCookie = (name: string, hostname: string) => {
  const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const parts = hostname.split('.');

  // Clear for the current path and progressively broader domains.
  document.cookie = `${name}=;expires=${expires};path=/`;
  for (let index = 0; index < parts.length; index += 1) {
    const domain = parts.slice(index).join('.');
    document.cookie = `${name}=;expires=${expires};path=/;domain=${domain}`;
  }
};

/**
 * Clears all cookies on the first page load per tab and refreshes once so
 * downstream logic runs without stale session data.
 */
export const useCookieReset = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    const flagKey = 'cookiesClearedOnce';
    let storageAvailable = true;
    try {
      if (sessionStorage.getItem(flagKey) === 'true') {
        return;
      }
      sessionStorage.setItem(flagKey, 'pending');
    } catch {
      storageAvailable = false;
    }

    if (!storageAvailable) {
      return;
    }

    if (sessionStorage.getItem(flagKey) === 'true') {
      return;
    }

    const rawCookies = document.cookie ? document.cookie.split(';') : [];
    const cookieNames = rawCookies
      .map((cookie) => {
        const eqPosition = cookie.indexOf('=');
        const name = eqPosition > -1 ? cookie.slice(0, eqPosition) : cookie;
        return name.trim();
      })
      .filter(Boolean);

    sessionStorage.setItem(flagKey, 'true');

    if (cookieNames.length === 0) {
      return;
    }

    const hostname = window.location.hostname;
    cookieNames.forEach((name) => clearCookie(name, hostname));
    window.location.reload();
  }, []);
};
