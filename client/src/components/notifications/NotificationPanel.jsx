import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckSquare,
  Users,
  GraduationCap,
  BookOpen,
  Sparkles,
  CheckCheck,
  Bell,
  Clock,
  Loader2,
} from 'lucide-react';

export const NotificationPanel = ({
  notifications = [],
  unreadCount = 0,
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  isMarkingAll = false,
  onClose,
}) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'assignment_created':
        return <FileText className="w-4 h-4 text-sky-400" />;
      case 'task_assignment':
        return <CheckSquare className="w-4 h-4 text-indigo-400" />;
      case 'project_invitation':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'faculty_feedback':
        return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      case 'course_announcement':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read && onMarkAsRead) {
      onMarkAsRead(notif._id);
    }

    if (notif.relatedResource?.url) {
      if (onClose) onClose();
      navigate(notif.relatedResource.url);
    }
  };

  return (
    <div className="glass-panel w-80 sm:w-96 rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden flex flex-col max-h-[500px] animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            disabled={isMarkingAll}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
          >
            {isMarkingAll ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2">
              <Bell className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-300">All Caught Up!</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              You will receive real-time alerts for project invites, task updates, and course deliverables.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 hover:bg-slate-850/60 transition-all cursor-pointer flex items-start gap-3 group relative ${
                !notif.read ? 'bg-indigo-600/5' : 'bg-transparent'
              }`}
            >
              {/* Type Icon */}
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover:border-indigo-500/30 transition-colors">
                {getIcon(notif.type)}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`text-xs truncate ${
                      !notif.read ? 'font-bold text-white' : 'font-medium text-slate-300'
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(notif.createdAt)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                  {notif.message}
                </p>
              </div>

              {/* Unread Status Dot */}
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 shadow-sm shadow-indigo-500/50" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
