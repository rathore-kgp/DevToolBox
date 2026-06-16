import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/index';
import { lazy, Suspense, useEffect, useState } from 'react';

import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { checkAuth } from './store/slices/authSlice';

// Lazy loaded pages — code splitting starts here
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const Layout = lazy(() => import('./components/layout/Layout'));
const JsonToolsPage = lazy(() => import('./pages/tools/JsonToolPage'));
const EncodingToolsPage = lazy(() => import('./pages/tools/EncodingToolsPage'));

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
            <Route path="tools/json" element={<JsonToolsPage />} />
            <Route path="tools/encoding" element={<EncodingToolsPage />} />
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