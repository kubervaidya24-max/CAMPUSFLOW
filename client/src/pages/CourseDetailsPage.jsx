import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Users,
  GraduationCap,
  Building,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Mail,
  Award,
} from 'lucide-react';

export const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students'
  const [actionMessage, setActionMessage] = useState(null);

  const {
    data: courseData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id),
  });

  const course = courseData?.data?.course;
  const isEnrolled = courseData?.data?.isEnrolled;
  const isOwner = courseData?.data?.isOwner;
  const isStudent = user?.role === 'student';

  // Toggle syllabus accordion
  const toggleWeek = (week) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [week]: !prev[week],
    }));
  };

  // Enroll Mutation
  const enrollMutation = useMutation({
    mutationFn: () => courseService.enrollCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setActionMessage({ type: 'success', text: 'You have successfully enrolled in this course!' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Enrollment failed.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  // Unenroll Mutation
  const unenrollMutation = useMutation({
    mutationFn: () => courseService.unenrollCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setActionMessage({ type: 'success', text: 'You have left this course.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to unenroll.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => courseService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate('/courses');
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete course.' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-xs font-medium">Loading course syllabus & details...</p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-red-500/30">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-slate-400 text-xs mb-6">
            {error?.message || 'The requested course does not exist or you do not have permission to view it.'}
          </p>
          <Link
            to="/courses"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  const enrolledStudents = course.enrolledStudents || [];
  const enrolledCount = enrolledStudents.length;
  const capacity = course.capacity || 60;
  const percentFilled = Math.min(100, Math.round((enrolledCount / capacity) * 100));

  const statusStyles = {
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Catalog</span>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              to={`/courses/${course._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Course</span>
            </Link>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                  deleteMutation.mutate();
                }
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400 text-xs transition-colors"
              title="Delete Course"
            >
              <Trash2 className="w-4 h-4" />
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

      {/* Hero Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-bold px-3 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                {course.code}
              </span>
              <span
                className={`text-xs font-semibold uppercase tracking-wider px-3 py-0.5 rounded-full border ${
                  statusStyles[course.status] || statusStyles.published
                }`}
              >
                {course.status}
              </span>
              <span className="text-xs font-medium text-slate-400 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                {course.credits} Academic Credits
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-sky-400" />
                {course.department}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Semester {course.semester}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                {enrolledCount} / {capacity} Students Enrolled ({percentFilled}%)
              </span>
            </div>
          </div>

          {/* Student Enrollment CTA */}
          {isStudent && (
            <div className="flex-shrink-0">
              {isEnrolled ? (
                <div className="flex flex-col gap-2 items-end">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enrolled in this Course</span>
                  </span>
                  <button
                    onClick={() => unenrollMutation.mutate()}
                    disabled={unenrollMutation.isPending}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors underline"
                  >
                    Unenroll / Leave Course
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending || enrolledCount >= capacity || course.status !== 'published'}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  {enrollMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enrolling...</span>
                    </>
                  ) : enrolledCount >= capacity ? (
                    <span>Course is Full</span>
                  ) : (
                    <span>Enroll Now</span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs if owner faculty */}
      {isOwner && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Course Syllabus & Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Enrolled Students ({enrolledCount})</span>
          </button>
        </div>
      )}

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Description & Syllabus */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Course Description & Objectives</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* Syllabus Accordion */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Syllabus & Weekly Schedule ({course.syllabus?.length || 0} Modules)</span>
                </h2>
              </div>

              {course.syllabus && course.syllabus.length > 0 ? (
                <div className="space-y-3">
                  {course.syllabus.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleWeek(item.week)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-850 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            Week {item.week}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-white">
                            {item.title}
                          </span>
                        </div>
                        {expandedWeeks[item.week] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {expandedWeeks[item.week] && (
                        <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50 bg-slate-950/40">
                          {item.description || 'No detailed subtopics provided for this week.'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs">No weekly syllabus modules published yet.</p>
              )}
            </div>
          </div>

          {/* Right 1 Col: Instructor & Schedule Meta */}
          <div className="space-y-6">
            {/* Instructor Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Course Instructor</span>
              </h2>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-base font-bold text-white overflow-hidden shadow-md">
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

                <div>
                  <Link
                    to={`/profile/${course.faculty?._id}`}
                    className="text-sm font-bold text-white hover:text-indigo-300 transition-colors block"
                  >
                    {course.faculty?.name}
                  </Link>
                  <span className="text-[11px] text-indigo-400 block">
                    {course.faculty?.profile?.designation || 'Faculty Member'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{course.faculty?.email}</span>
                </div>
                {course.faculty?.profile?.officeLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{course.faculty.profile.officeLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Class Schedule & Venue</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Lecture Days:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {course.schedule?.days && course.schedule.days.length > 0 ? (
                      course.schedule.days.map((day, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium"
                        >
                          {day}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">To be announced</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Lecture Timing:</span>
                  <span className="text-slate-200 font-medium">
                    {course.schedule?.time || 'TBA'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Classroom / Lecture Hall:</span>
                  <span className="text-slate-200 font-medium">
                    {course.schedule?.room || 'TBA'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Enrolled Students Management (For Faculty Owner) */}
      {isOwner && activeTab === 'students' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Enrolled Students ({enrolledCount} / {capacity})
              </h2>
              <p className="text-slate-400 text-xs">
                Students currently registered in this course section
              </p>
            </div>
          </div>

          {enrolledStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No students have enrolled in this course yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">College ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Enrolled On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {enrolledStudents.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/profile/${item.student?._id}`}
                          className="font-semibold text-slate-200 hover:text-indigo-300 transition-colors"
                        >
                          {item.student?.name}
                        </Link>
                        <span className="block text-[11px] text-slate-500">
                          {item.student?.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {item.student?.profile?.collegeId || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {item.student?.profile?.department || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {item.student?.profile?.semester ? `Sem ${item.student.profile.semester}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {item.enrolledAt
                          ? new Date(item.enrolledAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
