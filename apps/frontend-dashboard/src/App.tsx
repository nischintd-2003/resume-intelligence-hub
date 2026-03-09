import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layout';
import { ROUTES } from './constants/nav.constants';
import PageLoader from './components/loading/PageLoader';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/Login'));
const RegisterPage = lazy(() => import('./pages/auth/Register'));

// Dashboard Page
const AnalyticsPage = lazy(() => import('./pages/dashboard/Analytics'));
const ResumesPage = lazy(() => import('./pages/dashboard/Resumes'));
const JobsPage = lazy(() => import('./pages/dashboard/Jobs'));
const UploadPage = lazy(() => import('./pages/dashboard/Upload'));

//  Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

//  App

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/*  Public  */}
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

              {/*  Protected */}
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to={ROUTES.ANALYTICS} replace />} />

                <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
                <Route path={ROUTES.RESUMES} element={<ResumesPage />} />
                <Route path={ROUTES.JOBS} element={<JobsPage />} />
                <Route path={ROUTES.UPLOAD} element={<UploadPage />} />
              </Route>

              {/*  Fallback */}
              <Route path="*" element={<Navigate to={ROUTES.ANALYTICS} replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
