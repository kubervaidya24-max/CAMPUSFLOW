import { useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { RootLayout } from './components/layout/RootLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Code-split / Lazy-loaded Route Components for Optimized Initial Load
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage || m.default }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage || m.default }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage || m.default }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage || m.default }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage || m.default }))
);
const EditProfilePage = lazy(() =>
  import('./pages/EditProfilePage').then((m) => ({ default: m.EditProfilePage || m.default }))
);
const CoursesPage = lazy(() =>
  import('./pages/CoursesPage').then((m) => ({ default: m.CoursesPage || m.default }))
);
const CourseDetailsPage = lazy(() =>
  import('./pages/CourseDetailsPage').then((m) => ({ default: m.CourseDetailsPage || m.default }))
);
const CourseEditorPage = lazy(() =>
  import('./pages/CourseEditorPage').then((m) => ({ default: m.CourseEditorPage || m.default }))
);
const AssignmentsPage = lazy(() =>
  import('./pages/AssignmentsPage').then((m) => ({ default: m.AssignmentsPage || m.default }))
);
const AssignmentDetailsPage = lazy(() =>
  import('./pages/AssignmentDetailsPage').then((m) => ({ default: m.AssignmentDetailsPage || m.default }))
);
const AssignmentEditorPage = lazy(() =>
  import('./pages/AssignmentEditorPage').then((m) => ({ default: m.AssignmentEditorPage || m.default }))
);
const ProjectsPage = lazy(() =>
  import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage || m.default }))
);
const ProjectDetailsPage = lazy(() =>
  import('./pages/ProjectDetailsPage').then((m) => ({ default: m.ProjectDetailsPage || m.default }))
);
const ProjectEditorPage = lazy(() =>
  import('./pages/ProjectEditorPage').then((m) => ({ default: m.ProjectEditorPage || m.default }))
);
const PlacementPage = lazy(() =>
  import('./pages/PlacementPage').then((m) => ({ default: m.PlacementPage || m.default }))
);
const ResumeBuilderPage = lazy(() =>
  import('./pages/ResumeBuilderPage').then((m) => ({ default: m.ResumeBuilderPage || m.default }))
);
const AnalyticsDashboardPage = lazy(() =>
  import('./pages/AnalyticsDashboardPage').then((m) => ({ default: m.AnalyticsDashboardPage || m.default }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage || m.default }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage || m.default }))
);

// Fallback skeleton loader during asynchronous chunk loading
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    <span className="text-xs font-semibold text-slate-400">Loading module...</span>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
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
              <Route
                path="analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
