import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Building,
  CheckCircle2,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CourseCard = ({ course, onEnroll, onUnenroll, isEnrolling = false }) => {
  const { user } = useAuth();

  const isStudent = user?.role === 'student';
  const isOwner = course.faculty?._id === user?._id || course.faculty === user?._id;
  const isEnrolled = course.enrolledStudents?.some((e) =>
    e.student?._id ? e.student._id === user?._id : e.student === user?._id
  );

  const enrolledCount = course.enrolledCount ?? course.enrolledStudents?.length ?? 0;
  const capacity = course.capacity || 60;
  const percentFilled = Math.min(100, Math.round((enrolledCount / capacity) * 100));

  const statusStyles = {
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800/90 hover:border-indigo-500/40 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden shadow-xl hover:shadow-indigo-500/10">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-colors pointer-events-none" />

      <div>
        {/* Top Header: Code, Status & Credits */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
              {course.code}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                statusStyles[course.status] || statusStyles.published
              }`}
            >
              {course.status}
            </span>
          </div>

          <span className="text-xs font-medium text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            {course.credits} Credits
          </span>
        </div>

        {/* Title */}
        <Link to={`/courses/${course._id}`} className="block group-hover:text-indigo-300 transition-colors">
          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1 mb-2">
            {course.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
          {course.description}
        </p>

        {/* Department & Semester Meta */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mb-4 pb-4 border-b border-slate-800/80">
          <span className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-sky-400" />
            {course.department}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            Semester {course.semester}
          </span>
        </div>
      </div>

      <div>
        {/* Faculty Instructor Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300 overflow-hidden flex-shrink-0">
              {course.faculty?.profile?.avatar ? (
                <img
                  src={course.faculty.profile.avatar}
                  alt={course.faculty.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                course.faculty?.name?.charAt(0) || 'F'
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-200 line-clamp-1">
                {course.faculty?.name || 'Faculty Member'}
              </span>
              <span className="text-[10px] text-slate-500">Instructor</span>
            </div>
          </div>

          {/* Enrollment Progress Meter */}
          <div className="text-right">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {enrolledCount} / {capacity}
            </span>
            <div className="w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all ${
                  percentFilled >= 100
                    ? 'bg-red-500'
                    : percentFilled >= 80
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2">
          <Link
            to={`/courses/${course._id}`}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {isStudent && (
            <>
              {isEnrolled ? (
                <button
                  type="button"
                  onClick={() => onUnenroll && onUnenroll(course._id)}
                  disabled={isEnrolling}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-red-500/10 text-emerald-400 hover:text-red-400 border border-emerald-500/20 hover:border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enrolled</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onEnroll && onEnroll(course._id)}
                  disabled={isEnrolling || enrolledCount >= capacity || course.status !== 'published'}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
                >
                  {enrolledCount >= capacity ? 'Full' : 'Enroll'}
                </button>
              )}
            </>
          )}

          {isOwner && (
            <Link
              to={`/courses/${course._id}/edit`}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-300 transition-colors"
              title="Edit Course"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
