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
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { CourseEditorPage } from './pages/CourseEditorPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { AssignmentDetailsPage } from './pages/AssignmentDetailsPage';
import { AssignmentEditorPage } from './pages/AssignmentEditorPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ProjectEditorPage } from './pages/ProjectEditorPage';
import { PlacementPage } from './pages/PlacementPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
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
            <Route
              path="courses"
              element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses/new"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <CourseEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses/:id"
              element={
                <ProtectedRoute>
                  <CourseDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <CourseEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="assignments"
              element={
                <ProtectedRoute>
                  <AssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="assignments/new"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <AssignmentEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="assignments/:id"
              element={
                <ProtectedRoute>
                  <AssignmentDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="assignments/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <AssignmentEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/new"
              element={
                <ProtectedRoute>
                  <ProjectEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id/edit"
              element={
                <ProtectedRoute>
                  <ProjectEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="placements"
              element={
                <ProtectedRoute>
                  <PlacementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="resumes"
              element={
                <ProtectedRoute>
                  <ResumeBuilderPage />
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
