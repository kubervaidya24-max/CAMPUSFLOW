import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assignmentService } from '../services/assignmentService';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import { AssignmentCard } from '../components/assignments/AssignmentCard';
import {
  FileText,
  Search,
  Plus,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const AssignmentsPage = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'submitted' | 'graded'
  const [searchTerm, setSearchTerm] = useState('');

  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  // Fetch student/faculty courses for filter dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'forAssignments'],
    queryFn: () => courseService.getCourses(),
  });

  const courses = coursesData?.data?.courses || [];

  // Fetch assignments
  const {
    data: assignmentsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['assignments', selectedCourse],
    queryFn: () => assignmentService.getAssignments({ courseId: selectedCourse || undefined }),
  });

  const allAssignments = assignmentsData?.data?.assignments || [];

  // Filter assignments by Tab and Search
  const filteredAssignments = allAssignments.filter((a) => {
    // 1. Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(term);
      const matchCode = a.course?.code?.toLowerCase().includes(term);
      if (!matchTitle && !matchCode) return false;
    }

    // 2. Student Status tab
    if (isStudent && activeTab !== 'all') {
      const status = a.submissionStatus || (a.mySubmission ? a.mySubmission.status : 'pending');
      if (activeTab === 'pending' && status !== 'pending') return false;
      if (activeTab === 'submitted' && status !== 'submitted' && status !== 'late') return false;
      if (activeTab === 'graded' && status !== 'graded') return false;
    }

    return true;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Coursework & Grading
            </span>
            <span className="text-xs text-slate-400">• Level 4 Assignment Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Assignments & Submissions
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
            Track upcoming deadlines, submit lab deliverables, receive feedback, and view marks.
          </p>
        </div>

        {isFaculty && (
          <Link
            to="/assignments/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4">
        {/* Student Status Tabs */}
        {isStudent && (
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            {['all', 'pending', 'submitted', 'graded'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800/60'
                }`}
              >
                {tab === 'all' ? 'All Assignments' : tab}
              </button>
            ))}
          </div>
        )}

        {/* Search & Course Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by assignment title or course code..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All My Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-xs font-medium">Loading coursework & assignments...</p>
        </div>
      ) : isError ? (
        <div className="p-8 rounded-3xl glass-panel border border-red-500/30 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-white text-sm font-semibold">Failed to load assignments</p>
          <p className="text-slate-400 text-xs mt-1">{error?.message}</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
            <FileText className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Assignments Found</h3>
          <p className="text-slate-400 text-xs max-w-md mb-6 leading-relaxed">
            {activeTab === 'pending'
              ? 'Great work! You have no pending assignments due.'
              : isFaculty
              ? 'No assignments created yet for this course. Click "Create Assignment" to post one!'
              : 'No assignments match your filter criteria.'}
          </p>
          {isFaculty && (
            <Link
              to="/assignments/new"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20"
            >
              Create New Assignment
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
