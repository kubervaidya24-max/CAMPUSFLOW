import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
