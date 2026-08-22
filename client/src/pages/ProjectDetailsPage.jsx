import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { KanbanBoard } from '../components/projects/KanbanBoard';
import {
  FolderGit2,
  Users,
  Trello,
  History,
  ArrowLeft,
  Plus,
  Mail,
  UserX,
  LogOut,
  ExternalLink,
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Edit3,
} from 'lucide-react';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'team' | 'activities'
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch Project Details
  const {
    data: projectData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id),
  });

  const project = projectData?.data?.project;
  const isOwner = project?.owner?._id === user?._id || user?.role === 'admin';
  const members = project?.members || [];

  // Fetch Project Tasks
  const { data: tasksData } = useQuery({
    queryKey: ['projectTasks', id],
    queryFn: () => projectService.getTasks(id),
    enabled: Boolean(project),
  });

  const tasks = tasksData?.data?.tasks || [];

  // Fetch Project Activities
  const { data: activitiesData } = useQuery({
    queryKey: ['projectActivities', id],
    queryFn: () => projectService.getActivities(id),
    enabled: activeTab === 'activities',
  });

  const activities = activitiesData?.data?.activities || [];

  // Send Invite Mutation
  const inviteMutation = useMutation({
    mutationFn: (data) => projectService.inviteMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setActionMessage({ type: 'success', text: 'Invitation sent to collaborator!' });
      setTimeout(() => setActionMessage(null), 3000);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to send invitation' });
    },
  });

  // Remove Member Mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId) => projectService.removeMember(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setActionMessage({ type: 'success', text: 'Member removed from project' });
      setTimeout(() => setActionMessage(null), 3000);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to remove member' });
    },
  });

  // Leave Project Mutation
  const leaveMutation = useMutation({
    mutationFn: () => projectService.leaveProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to leave project' });
    },
  });

  // Delete Project Mutation
  const deleteMutation = useMutation({
    mutationFn: () => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-xs font-medium">Opening project workspace...</p>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-red-500/30">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied / Not Found</h2>
          <p className="text-slate-400 text-xs mb-6">
            {error?.message || 'You must be an invited project member to enter this workspace.'}
          </p>
          <Link
            to="/projects"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Breadcrumb & Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${project._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Project</span>
            </Link>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this project and all tasks?')) {
                  deleteMutation.mutate();
                }
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400 text-xs"
              title="Delete Project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Hero Workspace Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {project.status}
              </span>
              {project.technologies?.map((tech, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {project.title}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Repository & Demo Links */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors"
              >
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <span>GitHub</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'kanban'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800/60'
          }`}
        >
          <Trello className="w-3.5 h-3.5" />
          <span>Kanban Board</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-200">
            {tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'team'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Roster</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-200">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'activities'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800/60'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Activity Feed</span>
        </button>
      </div>

      {/* Tab 1: Kanban Board View */}
      {activeTab === 'kanban' && (
        <KanbanBoard projectId={project._id} tasks={tasks} members={members} />
      )}

      {/* Tab 2: Team Roster View */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Project Collaborators ({members.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite Teammate</span>
              </button>
              {!isOwner && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to leave this project team?')) {
                      leaveMutation.mutate();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400 text-xs font-medium flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave Project</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m, idx) => {
              const u = m.user;
              const isMemberOwner = project.owner._id === u?._id || project.owner === u?._id;
              return (
                <div
                  key={idx}
                  className="glass-panel p-5 rounded-3xl border border-slate-800 flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                      {u?.profile?.avatar ? (
                        <img
                          src={u.profile.avatar}
                          alt={u.name}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        u?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{u?.name}</span>
                        {isMemberOwner && (
                          <Shield className="w-3 h-3 text-purple-400" title="Project Owner" />
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">{u?.email}</p>
                    </div>
                  </div>

                  {isOwner && !isMemberOwner && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${u.name} from project?`)) {
                          removeMemberMutation.mutate(u._id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 text-xs"
                      title="Remove Member"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Activity Timeline View */}
      {activeTab === 'activities' && (
        <div className="space-y-4 max-w-3xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Audit Trail & Event History
          </h2>

          {activities.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs glass-panel rounded-3xl border border-slate-800">
              No recorded project activities yet.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div
                  key={act._id}
                  className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-start gap-3 text-xs"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-300 flex-shrink-0">
                    {act.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{act.user?.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(act.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-slate-400 mt-1">
                      {act.action === 'PROJECT_CREATED' && 'created this project.'}
                      {act.action === 'INVITATION_SENT' &&
                        `sent an invitation to ${act.details?.targetName || act.details?.targetEmail}.`}
                      {act.action === 'MEMBER_JOINED' && 'joined the project team.'}
                      {act.action === 'MEMBER_REMOVED' && 'was removed from the team.'}
                      {act.action === 'MEMBER_LEFT' && 'left the project team.'}
                      {act.action === 'TASK_CREATED' &&
                        `created task "${act.details?.taskTitle}".`}
                      {act.action === 'TASK_MOVED' &&
                        `moved task "${act.details?.taskTitle}" to ${act.details?.toStatus}.`}
                      {act.action === 'TASK_COMPLETED' &&
                        `completed task "${act.details?.taskTitle}"! 🎉`}
                      {act.action === 'TASK_DELETED' &&
                        `deleted task "${act.details?.taskTitle}".`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Invite Teammate</span>
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Student Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@campusflow.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Project Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="member">Member (Can create, edit, move tasks)</option>
                  <option value="lead">Lead (Can manage tasks & invite members)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
