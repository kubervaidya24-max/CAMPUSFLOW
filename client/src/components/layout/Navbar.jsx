import { Link } from 'react-router-dom';
import {
  Layers,
  Activity,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  BookOpen,
  FileText,
  FolderGit2,
  Briefcase,
  FileCheck,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';

export const Navbar = ({ isBackendOnline = false, backendLatency = null }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const roleColors = {
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    faculty: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                CampusFlow
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Level 13
              </span>
            </div>
            <span className="text-xs text-slate-400">Unified Student Platform</span>
          </div>
        </Link>

        {/* Center/Right Items */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Navigation links if logged in */}
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/courses"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Courses</span>
              </Link>

              <Link
                to="/assignments"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">Assignments</span>
              </Link>

              <Link
                to="/projects"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Projects</span>
              </Link>

              <Link
                to="/placements"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Placements</span>
              </Link>

              <Link
                to="/resumes"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Resume</span>
              </Link>

              <Link
                to="/analytics"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>

              {/* Admin Panel Link (Only visible to Admin role) */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 text-xs font-bold text-red-400 transition-colors shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          )}

          {/* API Health Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBackendOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="text-slate-300 font-medium">
              API: {isBackendOnline ? 'Operational' : 'Connecting...'}
            </span>
            {backendLatency !== null && (
              <span className="text-slate-500 font-mono text-[11px] hidden xl:inline">
                ({backendLatency}ms)
              </span>
            )}
          </div>

          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs font-medium transition-all"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Health</span>
          </a>

          {/* Auth Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Notification Bell Dropdown */}
              <NotificationBell />

              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
              >
                {user?.profile?.avatar ? (
                  <img
                    src={user.profile.avatar}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  style={{ display: user?.profile?.avatar ? 'none' : 'flex' }}
                  className="w-5 h-5 rounded-full bg-indigo-600 items-center justify-center text-[10px] font-bold text-white"
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline font-semibold">{user?.name?.split(' ')[0]}</span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded border ${
                    roleColors[user?.role] || roleColors.student
                  }`}
                >
                  {user?.role}
                </span>
              </Link>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 text-slate-400 transition-colors text-xs flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
