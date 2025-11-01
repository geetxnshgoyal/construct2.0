import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingOverlay from './components/LoadingOverlay';
import ScrollRestoration from './components/ScrollRestoration';
import { useAnalytics } from './hooks/useAnalytics';
import { useCookieReset } from './hooks/useCookieReset';

const HomePage = lazy(() => import('./pages/Home'));
const RegistrationPage = lazy(() => import('./pages/Registration'));
const AdminPage = lazy(() => import('./pages/Admin'));
const SubmissionDemoPage = lazy(() => import('./pages/SubmissionDemo'));

export default function App() {
  useCookieReset();
  useAnalytics();

  return (
    <Layout>
      <Suspense fallback={<LoadingOverlay message="Charging the cosmos…" />}>
        <ScrollRestoration />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/submit" element={<SubmissionDemoPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
