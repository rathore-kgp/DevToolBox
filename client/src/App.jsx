import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/index';
import { lazy, Suspense, useEffect, useState } from 'react';

import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { checkAuth } from './store/slices/authSlice';

// Lazy loaded pages — code splitting starts here
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const Layout = lazy(() => import('./components/layout/Layout'));

// Tool pages — 6 tools + Code Room
const JsonToolsPage = lazy(() => import('./pages/tools/JsonToolPage'));
const EncodingToolsPage = lazy(() => import('./pages/tools/EncodingToolsPage'));
const RegexTesterPage = lazy(() => import('./pages/tools/RegexTesterPage'));
const JwtToolPage = lazy(() => import('./pages/tools/JwtToolPage'));
const ApiTesterPage = lazy(() => import('./pages/tools/ApiTesterPage'));
const CurlConverterPage = lazy(() => import('./pages/tools/CurlConverterPage'));
const CodeRoomPage = lazy(() => import('./pages/tools/CodeRoomPage'));

function AppContent() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (err) {
        // Safe to ignore on mount — user is simply not logged in
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, [dispatch]);

  if (isInitializing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Tool routes — paths match toolsRegistry.js exactly */}
            <Route path="json" element={
              <ErrorBoundary><JsonToolsPage /></ErrorBoundary>
            } />
            <Route path="encoding" element={
              <ErrorBoundary><EncodingToolsPage /></ErrorBoundary>
            } />
            <Route path="regex" element={
              <ErrorBoundary><RegexTesterPage /></ErrorBoundary>
            } />
            <Route path="jwt" element={
              <ErrorBoundary><JwtToolPage /></ErrorBoundary>
            } />

            {/* Phase 3 */}
            <Route path="api-tester" element={
              <ErrorBoundary><ApiTesterPage /></ErrorBoundary>
            } />
            <Route path="curl" element={
              <ErrorBoundary><CurlConverterPage /></ErrorBoundary>
            } />
            <Route path="collab" element={
              <ErrorBoundary><CodeRoomPage /></ErrorBoundary>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;