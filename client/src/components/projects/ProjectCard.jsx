import { Link } from 'react-router-dom';
import {
  Users,
  FolderGit2,
  ExternalLink,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProjectCard = ({ project }) => {
  const { user } = useAuth();
  const isOwner = project.owner?._id === user?._id || project.owner === user?._id;

  const statusStyles = {
    planning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    archived: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  const members = project.members || [];

  return (
    <div className="glass-panel rounded-3xl border border-slate-800/90 hover:border-indigo-500/40 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden shadow-xl hover:shadow-indigo-500/10">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-colors pointer-events-none" />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                statusStyles[project.status] || statusStyles.active
              }`}
            >
              {project.status}
            </span>
            {isOwner && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>Owner</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/projects/${project._id}`} className="block group-hover:text-indigo-300 transition-colors">
          <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 mb-2">
            {project.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Technology Pills */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Member Avatars Stack & Links */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mb-4">
          {/* Avatars */}
          <div className="flex items-center -space-x-2">
            {members.slice(0, 4).map((m, idx) => {
              const u = m.user;
              const name = u?.name || 'Member';
              return (
                <div
                  key={idx}
                  title={name}
                  className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-200 overflow-hidden shadow-sm"
                >
                  {u?.profile?.avatar ? (
                    <img src={u.profile.avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Links */}
          <div className="flex items-center gap-2">
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="Repository"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="Live Demo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Workspace CTA */}
        <Link
          to={`/projects/${project._id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 active:bg-indigo-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
