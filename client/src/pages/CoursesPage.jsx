import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import { CourseCard } from '../components/courses/CourseCard';
import {
  BookOpen,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const CoursesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'enrolled' | 'teaching'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';

  // Build Query Params based on tab & filters
  const queryParams = {
    search: searchTerm || undefined,
    department: selectedDepartment || undefined,
    semester: selectedSemester || undefined,
    enrolled: activeTab === 'enrolled' ? 'true' : undefined,
    facultyOnly: activeTab === 'teaching' ? 'true' : undefined,
  };

  const {
    data: coursesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['courses', activeTab, searchTerm, selectedDepartment, selectedSemester],
    queryFn: () => courseService.getCourses(queryParams),
    staleTime: 5000,
  });

  const courses = coursesData?.data?.courses || [];

  // Enroll Mutation
  const enrollMutation = useMutation({
    mutationFn: (courseId) => courseService.enrollCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setActionMessage({ type: 'success', text: 'Successfully enrolled in course!' });
      setTimeout(() => setActionMessage(null), 3500);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to enroll in course' });
      setTimeout(() => setActionMessage(null), 3500);
    },
  });

  // Unenroll Mutation
  const unenrollMutation = useMutation({
    mutationFn: (courseId) => courseService.unenrollCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setActionMessage({ type: 'success', text: 'Successfully left the course.' });
      setTimeout(() => setActionMessage(null), 3500);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to leave course' });
      setTimeout(() => setActionMessage(null), 3500);
    },
  });

  const departments = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Data Science',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Academic Hub
            </span>
            <span className="text-xs text-slate-400">• Level 3 Course System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Academic Courses & Syllabus
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
            Explore university courses, access faculty syllabi, manage enrollments, and track academic progression.
          </p>
        </div>

        {isFaculty && (
          <Link
            to="/courses/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </Link>
        )}
      </div>

      {/* Action Toast Feedback */}
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800/60'
            }`}
          >
            Explore Catalog
          </button>

          {isStudent && (
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'enrolled'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800/60'
              }`}
            >
              My Enrolled Courses
            </button>
          )}

          {isFaculty && (
            <button
              onClick={() => setActiveTab('teaching')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'teaching'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800/60'
              }`}
            >
              My Teaching Courses
            </button>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course title, code (e.g. CS101), or topic..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  Semester {num}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-xs font-medium">Loading courses...</p>
        </div>
      ) : isError ? (
        <div className="p-8 rounded-3xl glass-panel border border-red-500/30 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-white text-sm font-semibold">Failed to load courses</p>
          <p className="text-slate-400 text-xs mt-1">{error?.message}</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
            <BookOpen className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Courses Found</h3>
          <p className="text-slate-400 text-xs max-w-md mb-6 leading-relaxed">
            {activeTab === 'enrolled'
              ? 'You have not enrolled in any courses yet. Switch to "Explore Catalog" to find and enroll in courses!'
              : activeTab === 'teaching'
              ? 'You have not created any courses yet. Click "Create Course" to add your first syllabus!'
              : 'No courses match your current search and filter criteria.'}
          </p>
          {activeTab === 'enrolled' && (
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20"
            >
              Explore Available Courses
            </button>
          )}
          {activeTab === 'teaching' && isFaculty && (
            <Link
              to="/courses/new"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20"
            >
              Create New Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEnroll={(id) => enrollMutation.mutate(id)}
              onUnenroll={(id) => unenrollMutation.mutate(id)}
              isEnrolling={enrollMutation.isPending || unenrollMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
