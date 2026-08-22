import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Shield,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  Key,
  LogOut,
  Sparkles,
  Layers,
  BookOpen,
  FolderGit2,
  MessageSquare,
  Briefcase,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  const roleColors = {
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    faculty: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const roleBadgeStyle = roleColors[user?.role] || roleColors.student;

  const upcomingModules = [
    { title: 'Courses & Syllabus', level: 'Level 2', icon: BookOpen },
    { title: 'Assignments & Kanban', level: 'Level 3', icon: FolderGit2 },
    { title: 'Project Workspaces', level: 'Level 4', icon: Layers },
    { title: 'Real-time Messaging', level: 'Level 5', icon: MessageSquare },
    { title: 'Placement Preparation', level: 'Level 6', icon: Briefcase },
    { title: 'ATS Resume Builder', level: 'Level 7', icon: FileText },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Welcome Banner */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-indigo-300">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Hello, {user?.name || 'Student'}!
                </h1>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${roleBadgeStyle}`}
                >
                  {user?.role}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Authenticated session active with secure JWT access and HTTP-only refresh rotation.
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/20 text-red-300 text-xs font-semibold transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* Grid: Profile Details & Token Session Diagnostics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span>Student Profile Details</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-500">ID: {user?._id || '—'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  Email Address
                </span>
                <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Account Role
                </span>
                <p className="text-sm font-semibold text-white capitalize">{user?.role}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <Building className="w-3.5 h-3.5 text-sky-400" />
                  Department
                </span>
                <p className="text-sm font-semibold text-white">
                  {user?.profile?.department || 'Not specified'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                  Graduation Year
                </span>
                <p className="text-sm font-semibold text-white">
                  {user?.profile?.graduationYear || '2026'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 sm:col-span-2">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Account Registration Date
                </span>
                <p className="text-xs font-semibold text-slate-200">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Today'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Profile Management</span>
            <span className="text-indigo-400 font-medium">Ready for Level 2 (User Profiles)</span>
          </div>
        </div>

        {/* Security & Token Diagnostics */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Security & JWT Session</span>
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Access Token Lifetime</span>
                  <span className="text-emerald-400 font-mono font-semibold">15 Minutes</span>
                </div>
                <p className="text-[11px] text-slate-500">Short-lived in-memory bearer token</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Refresh Token Storage</span>
                  <span className="text-sky-400 font-mono font-semibold">HTTP-Only Cookie</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Protected against Cross-Site Scripting (XSS)
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Rotation & Revocation</span>
                  <span className="text-purple-400 font-mono font-semibold">Active in DB</span>
                </div>
                <p className="text-[11px] text-slate-500">Single-use token rotation on refresh</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Role-Based Access Control: Active</span>
          </div>
        </div>
      </section>

      {/* Forthcoming Modules Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Upcoming Functional Modules</h2>
            <p className="text-xs text-slate-400 mt-1">
              Modules will plug into this authenticated session in subsequent levels.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Level 1 Verified</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {upcomingModules.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                    <p className="text-[11px] font-mono text-slate-500">{item.level}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-500 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                  Locked
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
