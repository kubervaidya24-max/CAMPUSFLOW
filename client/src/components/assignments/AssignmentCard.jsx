import { Link } from 'react-router-dom';
import {
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AssignmentCard = ({ assignment }) => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const dueDate = new Date(assignment.dueDate);
  const isPastDue = Date.now() > dueDate.getTime();

  // Status mapping
  const status = assignment.submissionStatus || (assignment.mySubmission ? assignment.mySubmission.status : 'pending');

  const statusConfig = {
    pending: {
      label: isPastDue ? 'Overdue' : 'Pending',
      styles: isPastDue
        ? 'bg-red-500/10 text-red-400 border-red-500/20'
        : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: Clock3,
    },
    submitted: {
      label: 'Submitted',
      styles: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      icon: CheckCircle2,
    },
    late: {
      label: 'Submitted Late',
      styles: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      icon: AlertCircle,
    },
    graded: {
      label: 'Graded',
      styles: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Award,
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="glass-panel rounded-3xl border border-slate-800/90 hover:border-indigo-500/40 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden shadow-xl hover:shadow-indigo-500/10">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-colors pointer-events-none" />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
              {assignment.course?.code || 'COURSE'}
            </span>
            <span className="text-xs font-medium text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-xl border border-slate-800">
              {assignment.totalPoints} Points
            </span>
          </div>

          {isStudent && (
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${currentStatus.styles}`}
            >
              <StatusIcon className="w-3 h-3" />
              <span>{currentStatus.label}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/assignments/${assignment._id}`} className="block group-hover:text-indigo-300 transition-colors">
          <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 mb-2">
            {assignment.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
          {assignment.description}
        </p>

        {/* Course Info */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 pb-4 border-b border-slate-800/80">
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="line-clamp-1">{assignment.course?.title || 'Academic Course'}</span>
        </div>
      </div>

      <div>
        {/* Due Date & Score */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Due:{' '}
              <strong className={isPastDue && status === 'pending' ? 'text-red-400' : 'text-slate-200'}>
                {dueDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </span>
          </div>

          {isStudent && status === 'graded' && assignment.mySubmission?.grade && (
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              {assignment.mySubmission.grade.score} / {assignment.totalPoints}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/assignments/${assignment._id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 active:bg-indigo-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <span>{isStudent ? (status === 'pending' ? 'Submit Assignment' : 'View Submission') : 'Manage Submissions'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default AssignmentCard;
