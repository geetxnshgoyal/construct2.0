import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Only load analytics in production
const isDev = import.meta.env.DEV;
let Analytics: any = null;

if (!isDev) {
  try {
    const analyticsModule = await import('@vercel/analytics/react');
    Analytics = analyticsModule.Analytics;
  } catch (error) {
    console.warn('Analytics not available:', error);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      {Analytics && <Analytics />}
    </BrowserRouter>
  </StrictMode>
);
