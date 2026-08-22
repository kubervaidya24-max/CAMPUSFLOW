import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { ProjectCard } from '../components/projects/ProjectCard';
import {
  FolderGit2,
  Search,
  Plus,
  Mail,
  Check,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'invitations' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch Projects
  const {
    data: projectsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['projects', activeTab],
    queryFn: () =>
      projectService.getProjects({
        scope: activeTab === 'invitations' ? 'invitations' : undefined,
      }),
  });

  const projects = projectsData?.data?.projects || [];

  // Fetch Pending Invitations Count for Tab Badge
  const { data: invitesData } = useQuery({
    queryKey: ['projects', 'invitationsCount'],
    queryFn: () => projectService.getProjects({ scope: 'invitations' }),
  });

  const pendingInvites = invitesData?.data?.projects || [];

  // Respond to Invitation Mutation
  const respondMutation = useMutation({
    mutationFn: ({ projectId, action }) =>
      projectService.respondInvitation(projectId, { action }),
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setActionMessage({
        type: 'success',
        text: vars.action === 'accept' ? 'Joined project workspace!' : 'Invitation declined',
      });
      setTimeout(() => setActionMessage(null), 3000);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Action failed' });
    },
  });

  // Filter projects by search
  const filteredProjects = projects.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchTitle = p.title.toLowerCase().includes(term);
    const matchTech = p.technologies?.some((t) => t.toLowerCase().includes(term));
    return matchTitle || matchTech;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Team Workspace
            </span>
            <span className="text-xs text-slate-400">• Level 5 Project Collaboration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Collaborative Projects & Kanban
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
            Team up on software repositories, organize tasks on interactive Kanban boards, and track live activity.
          </p>
        </div>

        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Action Toast Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'my'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800/60'
            }`}
          >
            My Projects
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'invitations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800/60'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Invitations</span>
            {pendingInvites.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500 text-white">
                {pendingInvites.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects or tech stacks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Content Body */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-xs font-medium">Loading collaborative projects...</p>
        </div>
      ) : isError ? (
        <div className="p-8 rounded-3xl glass-panel border border-red-500/30 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-white text-sm font-semibold">Failed to load projects</p>
          <p className="text-slate-400 text-xs mt-1">{error?.message}</p>
        </div>
      ) : activeTab === 'invitations' ? (
        /* Pending Invitations View */
        filteredProjects.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
              <Mail className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Pending Invitations</h3>
            <p className="text-slate-400 text-xs max-w-md">
              When teammates invite you to collaborate on software projects, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((p) => (
              <div
                key={p._id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
                    Project Invitation
                  </span>
                  <span className="text-xs text-slate-500">
                    By {p.owner?.name}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() =>
                      respondMutation.mutate({ projectId: p._id, action: 'reject' })
                    }
                    disabled={respondMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 text-xs font-medium border border-slate-800 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() =>
                      respondMutation.mutate({ projectId: p._id, action: 'accept' })
                    }
                    disabled={respondMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Join</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
            <FolderGit2 className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Projects Found</h3>
          <p className="text-slate-400 text-xs max-w-md mb-6 leading-relaxed">
            You are not part of any project teams yet. Start a new project or ask your team to invite you!
          </p>
          <Link
            to="/projects/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
