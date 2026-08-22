import { Link } from 'react-router-dom';
import { Layers, Activity, Sparkles } from 'lucide-react';

export const Navbar = ({ isBackendOnline = false, backendLatency = null }) => {
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
                Level 0
              </span>
            </div>
            <span className="text-xs text-slate-400">Unified Student Platform</span>
          </div>
        </Link>

        {/* Status indicator & Navigation Items */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
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
            <span className="text-slate-300 font-medium hidden sm:inline">
              API: {isBackendOnline ? 'Operational' : 'Connecting...'}
            </span>
            {backendLatency !== null && (
              <span className="text-slate-500 font-mono text-[11px] hidden md:inline">
                ({backendLatency}ms)
              </span>
            )}
          </div>

          <a
            href="#architecture"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors hidden md:flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Architecture
          </a>

          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-all"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Raw Health JSON</span>
          </a>
        </div>
      </div>
    </header>
  );
};
