import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingOverlay from './components/LoadingOverlay';
import ScrollRestoration from './components/ScrollRestoration';
import { useAnalytics } from './hooks/useAnalytics';
import { useCookieReset } from './hooks/useCookieReset';
import { isRegistrationClosed, isSubmissionClosed } from './utils/registrationStatus';

const HomePage = lazy(() => import('./pages/Home'));
const RegistrationPage = lazy(() => import('./pages/Registration'));
const RegistrationClosedPage = lazy(() => import('./pages/RegistrationClosed'));
const AdminPage = lazy(() => import('./pages/Admin'));
const SubmitPage = lazy(() => import('./pages/Submit'));
const SubmitClosedPage = lazy(() => import('./pages/SubmitClosed'));

export default function App() {
  useCookieReset();
  useAnalytics();
  const navigate = useNavigate();
  const location = useLocation();
  const registrationClosed = isRegistrationClosed();
  const submissionClosed = isSubmissionClosed();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const hostname = window.location.hostname.toLowerCase();
    const submitDomain = 'submit.nstconstruct.xyz';

    if (hostname === submitDomain && location.pathname !== '/submit') {
      navigate('/submit', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Layout>
      <Suspense fallback={<LoadingOverlay message="Charging the cosmos…" />}>
        <ScrollRestoration />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegistrationClosedPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/submit" element={submissionClosed ? <SubmitClosedPage /> : <SubmitPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
