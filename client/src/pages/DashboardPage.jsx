import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  BookOpen,
  FolderGit2,
  Briefcase,
  FileText,
  BarChart3,
  FileCheck,
  Award,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  const { data: analyticsData } = useQuery({
    queryKey: ['studentDashboardAnalytics'],
    queryFn: () => analyticsService.getStudentAnalytics(),
    enabled: !!user,
  });

  const stats = analyticsData?.data?.data || {
    academic: { enrolledCourses: 0, totalCredits: 0 },
    assignments: { submittedCount: 0, totalAssignments: 0, averageGradePercentage: 0 },
    projects: { totalProjects: 0, tasks: { completed: 0, totalAssigned: 0, completionRate: 0 } },
    career: { dsa: { solvedCount: 0 }, jobs: { offersReceived: 0, activePipeline: 0 } },
  };

  const roleColors = {
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    faculty: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const roleBadgeStyle = roleColors[user?.role] || roleColors.student;

  const activeModules = [
    { title: 'Academic Courses', path: '/courses', desc: `${stats.academic.enrolledCourses} Enrolled (${stats.academic.totalCredits} Credits)`, icon: BookOpen, color: 'text-indigo-400' },
    { title: 'Assignments & Submissions', path: '/assignments', desc: `${stats.assignments.submittedCount} Submitted (${stats.assignments.averageGradePercentage}% Avg Grade)`, icon: FileText, color: 'text-sky-400' },
    { title: 'Project Workspaces', path: '/projects', desc: `${stats.projects.totalProjects} Active (${stats.projects.tasks.completionRate}% Tasks Done)`, icon: FolderGit2, color: 'text-emerald-400' },
    { title: 'Career & Placements', path: '/placements', desc: `${stats.career.dsa.solvedCount} DSA Solved • ${stats.career.jobs.offersReceived} Offers`, icon: Briefcase, color: 'text-amber-400' },
    { title: 'Dynamic Resume Builder', path: '/resumes', desc: 'ATS Layouts & PDF Export Engine', icon: FileCheck, color: 'text-purple-400' },
    { title: 'Data-Driven Analytics', path: '/analytics', desc: 'Real-time Aggregation Intelligence', icon: BarChart3, color: 'text-pink-400' },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Welcome Banner */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/25">
              {user?.profile?.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-[14px] object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-indigo-300">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
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
                {user?.profile?.bio || 'CampusFlow unified academic and professional ecosystem.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Analytics</span>
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/20 text-red-300 text-xs font-semibold transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick KPI Scorecards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-slate-900 shadow-lg">
          <div className="flex items-center justify-between text-indigo-400 text-xs font-bold uppercase">
            <span>Enrolled Credits</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.academic.totalCredits}</p>
          <span className="text-[11px] text-slate-400">{stats.academic.enrolledCourses} Active Courses</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-sky-500/20 bg-slate-900 shadow-lg">
          <div className="flex items-center justify-between text-sky-400 text-xs font-bold uppercase">
            <span>Assignment Avg</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.assignments.averageGradePercentage}%</p>
          <span className="text-[11px] text-slate-400">{stats.assignments.submittedCount} Submissions</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-slate-900 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase">
            <span>Task Velocity</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.projects.tasks.completionRate}%</p>
          <span className="text-[11px] text-slate-400">{stats.projects.tasks.completed} Tasks Done</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-slate-900 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase">
            <span>Placement Status</span>
            <Briefcase className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.career.jobs.offersReceived}</p>
          <span className="text-[11px] text-slate-400">{stats.career.jobs.activePipeline} In Interview Rounds</span>
        </div>
      </section>

      {/* Active Modules Hub */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">CampusFlow Module Workspaces</h2>
            <p className="text-xs text-slate-400">
              Access full collaborative modules powered by verified backend services.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Level 10 Operational</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeModules.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* User Profile & Diagnostics Details */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span>Profile & Identity</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-500">ID: {user?._id || '—'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  Email Address
                </span>
                <p className="text-sm font-semibold text-white font-mono">{user?.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <Building className="w-3.5 h-3.5 text-sky-400" />
                  Department
                </span>
                <p className="text-sm font-semibold text-white">{user?.department || 'Not Assigned'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  Semester / Year
                </span>
                <p className="text-sm font-semibold text-white">Semester {user?.semester || 1}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Joined Date
                </span>
                <p className="text-sm font-semibold text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Profile Management</span>
            <Link to="/profile/edit" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Edit Profile Settings ➔
            </Link>
          </div>
        </div>

        {/* Security & JWT Session */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Security & Tokens</span>
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Access Token</span>
                  <span className="text-emerald-400 font-mono font-semibold">15m TTL</span>
                </div>
                <p className="text-[11px] text-slate-500">Short-lived in-memory bearer token</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Refresh Token</span>
                  <span className="text-sky-400 font-mono font-semibold">HTTP-Only Cookie</span>
                </div>
                <p className="text-[11px] text-slate-500">Protected against Cross-Site Scripting</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Token Rotation</span>
                  <span className="text-purple-400 font-mono font-semibold">Single-Use</span>
                </div>
                <p className="text-[11px] text-slate-500">Revocation tree in MongoDB</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Role-Based Access Control: Active</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
