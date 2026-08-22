import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RootLayout } from './components/layout/RootLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App = () => {
  const [healthState, setHealthState] = useState({
    isOnline: false,
    latency: null,
  });

  const handleHealthUpdate = (status) => {
    setHealthState({
      isOnline: status.isOnline,
      latency: status.latency,
    });
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <RootLayout
                isBackendOnline={healthState.isOnline}
                backendLatency={healthState.latency}
              />
            }
          >
            <Route index element={<LandingPage onHealthUpdate={handleHealthUpdate} />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/:id"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
