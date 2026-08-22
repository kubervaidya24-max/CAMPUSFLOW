import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Server,
  Terminal,
  Layers,
  Shield,
  BookOpen,
  FolderGit2,
  MessageSquare,
  Briefcase,
  FileText,
  RefreshCw,
  Clock,
  Zap,
} from 'lucide-react';
import { healthService } from '../services/healthService';

export const LandingPage = ({ onHealthUpdate }) => {
  const [lastLatency, setLastLatency] = useState(null);

  const {
    data: healthResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const start = performance.now();
      const res = await healthService.checkHealth();
      const latency = Math.round(performance.now() - start);
      setLastLatency(latency);
      if (onHealthUpdate) {
        onHealthUpdate({ isOnline: true, latency });
      }
      return res;
    },
    refetchInterval: 15000,
    retry: 1,
  });

  const healthData = healthResponse?.data;
  const isHealthy = healthResponse?.success === true;

  const modules = [
    {
      title: 'Academic & Courses',
      desc: 'Syllabus tracking, lectures, course materials & attendance logs.',
      icon: BookOpen,
      level: 'Level 2',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    },
    {
      title: 'Assignments & Tasks',
      desc: 'Deadline tracker, submission portals, and interactive Kanban boards.',
      icon: FolderGit2,
      level: 'Level 3',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    },
    {
      title: 'Project Collaboration',
      desc: 'Team workspaces, task delegation, repository links, and milestones.',
      icon: Layers,
      level: 'Level 4',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400',
    },
    {
      title: 'Real-time Messaging',
      desc: 'Instant channel chats, direct team communication via Socket.IO.',
      icon: MessageSquare,
      level: 'Level 5',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    },
    {
      title: 'Placement Preparation',
      desc: 'Curated DSA sheets, interview experiences, and mock tests.',
      icon: Briefcase,
      level: 'Level 6',
      color: 'from-cyan-500/20 to-sky-500/20 text-cyan-400',
    },
    {
      title: 'Smart Resume Builder',
      desc: 'ATS-friendly dynamic resume generator with customized templates.',
      icon: FileText,
      level: 'Level 7',
      color: 'from-rose-500/20 to-red-500/20 text-rose-400',
    },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-16">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-6 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium backdrop-blur-sm animate-pulse-slow">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Foundation Level 0 Initialized & Verified</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl">
          Unified College Platform for{' '}
          <span className="text-gradient">Academics, Projects & Careers</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          CampusFlow streamlines student life into one cohesive ecosystem. From day-one
          coursework to project management and placement readiness.
        </p>
      </section>

      {/* Integration Verification & Live Backend Diagnostics */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Live Full-Stack Integration Verification
                {isHealthy && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Live Synced
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Verifying real-time HTTP communication between React/Vite Client & Express Backend
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Checking...' : 'Ping Endpoint'}</span>
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* API Status */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                Backend Status
              </span>
              <span className="text-[10px] font-mono text-slate-500">GET /api/health</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
              ) : isHealthy ? (
                <span className="text-emerald-400 font-bold text-base flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Operational (200)
                </span>
              ) : (
                <span className="text-amber-400 font-semibold text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Server Offline
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {healthData?.service || 'Express Server'}
            </p>
          </div>

          {/* Database Connectivity */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                Database State
              </span>
              <span className="text-[10px] font-mono text-slate-500">Mongoose</span>
            </div>
            <div className="mt-3">
              {isLoading ? (
                <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
              ) : (
                <span
                  className={`font-semibold text-sm uppercase tracking-wide px-2.5 py-1 rounded-lg inline-block ${
                    healthData?.database?.status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}
                >
                  {healthData?.database?.status || 'Standby / Check DB'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Database: {healthData?.database?.name || 'campusflow'}
            </p>
          </div>

          {/* Latency */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Roundtrip Latency
              </span>
              <span className="text-[10px] font-mono text-slate-500">Client ↔ API</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              {isLoading ? (
                <div className="h-6 w-16 bg-slate-800 animate-pulse rounded" />
              ) : (
                <span className="text-xl font-bold font-mono text-white">
                  {lastLatency !== null ? `${lastLatency}` : '—'}
                  <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Direct Axios response time</p>
          </div>

          {/* Server Uptime */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Process Uptime
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {healthData?.environment || 'dev'}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              {isLoading ? (
                <div className="h-6 w-20 bg-slate-800 animate-pulse rounded" />
              ) : (
                <span className="text-xl font-bold font-mono text-white">
                  {healthData?.uptimeSeconds !== undefined ? `${healthData.uptimeSeconds}s` : '—'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Awaiting sync'}
            </p>
          </div>
        </div>

        {/* Raw Payload Preview Accordion / Box */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800/90">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Raw Health Response Payload:
            </span>
            <span className="text-[11px] text-slate-500 font-mono">application/json</span>
          </div>
          <pre className="text-[12px] font-mono text-indigo-200/90 overflow-x-auto p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            {isLoading
              ? 'Loading backend payload...'
              : isError
              ? JSON.stringify({ error: error?.message || 'Failed to connect to API' }, null, 2)
              : JSON.stringify(healthResponse, null, 2)}
          </pre>
        </div>
      </section>

      {/* Architecture & Future Levels Roadmap Section */}
      <section id="architecture" className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4" /> Planned Module Roadmap
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Future Architecture & Levels
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            The foundation is designed with a clean separation of concerns, ready for seamless module
            plug-ins in forthcoming levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} border border-white/10 flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium font-mono text-slate-400 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/50">
                      {mod.level}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{mod.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Status</span>
                  <span className="text-slate-400 font-medium">Ready for Level Scaffolding</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
