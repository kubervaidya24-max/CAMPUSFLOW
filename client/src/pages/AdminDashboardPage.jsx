import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert,
  Users,
  Search,
  Trash2,
  Loader2,
  RefreshCw,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCheck,
  UserX,
  Code2,
  Plus,
  ExternalLink,
  Sparkles,
  X,
  BookOpen,
} from 'lucide-react';
import { adminService } from '../services/adminService';

const TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Recursion & Backtracking',
  'Stack & Queue',
  'Binary Search',
  'Heaps & HashMaps',
  'Greedy',
  'Trie',
  'Bit Manipulation',
  'Other',
];

const PLATFORMS = [
  'LeetCode',
  'Codeforces',
  'GeeksforGeeks',
  'HackerRank',
  'InterviewBit',
  'CodeChef',
  'NeetCode',
  'CodeStudio',
  'Other',
];

export const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'courses', 'projects', 'dsa', 'reports'

  // User Management Filters & Pagination
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');

  // Course Moderation Filters & Pagination
  const [coursePage, setCoursePage] = useState(1);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseStatus, setCourseStatus] = useState('');

  // Project Moderation Filters & Pagination
  const [projectPage, setProjectPage] = useState(1);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus, setProjectStatus] = useState('');

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  // DSA Sheet Management States
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isEditSheetModalOpen, setIsEditSheetModalOpen] = useState(false);
  const [dsaSearch, setDsaSearch] = useState('');

  const [questionForm, setQuestionForm] = useState({
    title: '',
    problemUrl: '',
    platform: 'LeetCode',
    topic: 'Arrays',
    subTopic: '',
    difficulty: 'Medium',
    tags: '',
    order: 1,
  });

  const [sheetForm, setSheetForm] = useState({
    title: '',
    description: '',
  });

  // 1. Fetch System Stats
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStats(),
  });

  // 2. Fetch Users
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers', userPage, userSearch, userRole, userStatus],
    queryFn: () =>
      adminService.getUsers({
        page: userPage,
        limit: 8,
        q: userSearch,
        role: userRole || undefined,
        status: userStatus || undefined,
      }),
    enabled: activeTab === 'users',
  });

  // 3. Fetch Courses
  const { data: coursesData, isLoading: coursesLoading, refetch: refetchCourses } = useQuery({
    queryKey: ['adminCourses', coursePage, courseSearch, courseStatus],
    queryFn: () =>
      adminService.getCourses({
        page: coursePage,
        limit: 8,
        q: courseSearch,
        status: courseStatus || undefined,
      }),
    enabled: activeTab === 'courses',
  });

  // 4. Fetch Projects
  const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['adminProjects', projectPage, projectSearch, projectStatus],
    queryFn: () =>
      adminService.getProjects({
        page: projectPage,
        limit: 8,
        q: projectSearch,
        status: projectStatus || undefined,
      }),
    enabled: activeTab === 'projects',
  });

  // 5. Fetch Must-to-Do DSA Sheet
  const { data: dsaSheetData, isLoading: dsaLoading, refetch: refetchDsa } = useQuery({
    queryKey: ['adminDsaSheet'],
    queryFn: () => adminService.getAdminDSASheet(),
    enabled: activeTab === 'dsa',
  });

  // 6. Fetch Reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => adminService.getReports(),
    enabled: activeTab === 'reports',
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => adminService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setEditingUser(null);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ courseId, data }) => adminService.updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId) => adminService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, data }) => adminService.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => adminService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // DSA Sheet Mutations
  const togglePublishMutation = useMutation({
    mutationFn: (isPublished) => adminService.togglePublishDSASheet(isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDsaSheet'] });
      queryClient.invalidateQueries({ queryKey: ['mustDoSheet'] });
    },
  });

  const updateSheetMetadataMutation = useMutation({
    mutationFn: (data) => adminService.updateDSASheetMetadata(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDsaSheet'] });
      queryClient.invalidateQueries({ queryKey: ['mustDoSheet'] });
      setIsEditSheetModalOpen(false);
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: (data) => adminService.addDSASheetQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDsaSheet'] });
      queryClient.invalidateQueries({ queryKey: ['mustDoSheet'] });
      setIsAddQuestionModalOpen(false);
      setQuestionForm({
        title: '',
        problemUrl: '',
        platform: 'LeetCode',
        topic: 'Arrays',
        subTopic: '',
        difficulty: 'Medium',
        tags: '',
        order: 1,
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ questionId, data }) => adminService.updateDSASheetQuestion(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDsaSheet'] });
      queryClient.invalidateQueries({ queryKey: ['mustDoSheet'] });
      setEditingQuestion(null);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId) => adminService.deleteDSASheetQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDsaSheet'] });
      queryClient.invalidateQueries({ queryKey: ['mustDoSheet'] });
    },
  });

  const stats = statsData?.data?.data || statsData?.data || {
    users: { total: 0, students: 0, faculty: 0, admins: 0, active: 0, suspended: 0 },
    academics: { totalCourses: 0, publishedCourses: 0, totalAssignments: 0, totalSubmissions: 0 },
    projects: { totalProjects: 0, activeProjects: 0 },
  };

  const usersList = usersData?.data?.data?.users || usersData?.data?.users || [];
  const userPagination =
    usersData?.data?.data?.pagination || usersData?.data?.pagination || { total: 0, page: 1, totalPages: 1 };

  const coursesList = coursesData?.data?.data?.courses || coursesData?.data?.courses || [];
  const coursePagination =
    coursesData?.data?.data?.pagination || coursesData?.data?.pagination || { total: 0, page: 1, totalPages: 1 };

  const projectsList = projectsData?.data?.data?.projects || projectsData?.data?.projects || [];
  const projectPagination =
    projectsData?.data?.data?.pagination || projectsData?.data?.pagination || { total: 0, page: 1, totalPages: 1 };

  const reports = reportsData?.data?.data || reportsData?.data || { recentActivities: [], recentUsers: [] };

  const dsaSheetPayload = dsaSheetData?.data?.data || dsaSheetData?.data || {};
  const dsaSheet = dsaSheetPayload.sheet || { title: 'Must-to-Do DSA Core Sheet', isPublished: false, totalQuestions: 0 };
  const dsaQuestions = (dsaSheetPayload.questions || []).filter((q) => {
    if (!dsaSearch.trim()) return true;
    const s = dsaSearch.trim().toLowerCase();
    return (
      q.title.toLowerCase().includes(s) ||
      (q.subTopic && q.subTopic.toLowerCase().includes(s)) ||
      q.topic.toLowerCase().includes(s)
    );
  });

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionForm.title.trim() || !questionForm.problemUrl.trim()) return;

    const payload = {
      ...questionForm,
      tags: typeof questionForm.tags === 'string'
        ? questionForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : questionForm.tags,
      order: Number(questionForm.order) || 1,
    };

    if (editingQuestion) {
      updateQuestionMutation.mutate({
        questionId: editingQuestion._id,
        data: payload,
      });
    } else {
      addQuestionMutation.mutate(payload);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="glass-panel p-6 rounded-3xl border border-red-500/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-400 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Administrative Command Center
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized governance, user suspension, course moderation, and curated DSA sheet management.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'users' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'courses' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'projects' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('dsa')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'dsa' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⭐ DSA Sheet</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'reports' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Audit Reports
              </button>
            </div>

            <button
              onClick={() => {
                refetchStats();
                if (activeTab === 'users') refetchUsers();
                if (activeTab === 'courses') refetchCourses();
                if (activeTab === 'projects') refetchProjects();
                if (activeTab === 'dsa') refetchDsa();
              }}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global KPI Scorecards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Users</span>
            <p className="text-2xl font-black text-white mt-1">{stats.users.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/20 text-center">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Students</span>
            <p className="text-2xl font-black text-emerald-300 mt-1">{stats.users.students}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/20 text-center">
            <span className="text-[10px] font-bold text-indigo-400 uppercase">Faculty</span>
            <p className="text-2xl font-black text-indigo-300 mt-1">{stats.users.faculty}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/20 text-center">
            <span className="text-[10px] font-bold text-red-400 uppercase">Suspended</span>
            <p className="text-2xl font-black text-red-400 mt-1">{stats.users.suspended}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 text-center">
            <span className="text-[10px] font-bold text-amber-400 uppercase">DSA Questions</span>
            <p className="text-2xl font-black text-amber-300 mt-1">{dsaSheet.totalQuestions || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/20 text-center">
            <span className="text-[10px] font-bold text-purple-400 uppercase">Active Projects</span>
            <p className="text-2xl font-black text-purple-300 mt-1">{stats.projects.activeProjects}</p>
          </div>
        </div>

        {/* ========================================== */}
        {/* TAB: DSA MANAGEMENT (Level 16) */}
        {/* ========================================== */}
        {activeTab === 'dsa' && (
          <div className="space-y-6">
            {/* Sheet Overview & Status Banner */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Singleton DSA Sheet
                  </span>
                  {dsaSheet.isPublished ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      Published / Live
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                      Draft / Hidden from Students
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{dsaSheet.title}</h2>
                <p className="text-xs text-slate-400 max-w-2xl">{dsaSheet.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => {
                    setSheetForm({ title: dsaSheet.title, description: dsaSheet.description });
                    setIsEditSheetModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Title</span>
                </button>

                <button
                  onClick={() => togglePublishMutation.mutate(!dsaSheet.isPublished)}
                  disabled={togglePublishMutation.isPending}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                    dsaSheet.isPublished
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {togglePublishMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{dsaSheet.isPublished ? 'Unpublish Sheet' : 'Publish Sheet Live'}</span>
                </button>

                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setQuestionForm({
                      title: '',
                      problemUrl: '',
                      platform: 'LeetCode',
                      topic: 'Arrays',
                      subTopic: '',
                      difficulty: 'Medium',
                      tags: '',
                      order: (dsaSheet.totalQuestions || 0) + 1,
                    });
                    setIsAddQuestionModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Questions Management Table */}
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search curated questions by title or topic..."
                    value={dsaSearch}
                    onChange={(e) => setDsaSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {dsaQuestions.length} of {dsaSheet.totalQuestions || 0} Questions
                </span>
              </div>

              {dsaLoading ? (
                <div className="py-20 text-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-500" />
                </div>
              ) : dsaQuestions.length === 0 ? (
                <div className="py-20 text-center text-slate-500 space-y-3">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">No questions on sheet</p>
                  <p className="text-xs text-slate-500">Click &quot;Add Question&quot; to begin curating the sheet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Question Title</th>
                        <th className="py-3 px-4">Topic</th>
                        <th className="py-3 px-4">Difficulty</th>
                        <th className="py-3 px-4">Platform</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {dsaQuestions.map((q, idx) => (
                        <tr key={q._id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                            {q.order || idx + 1}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span>{q.title}</span>
                              <a
                                href={q.problemUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:text-indigo-300"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            {q.subTopic && (
                              <p className="text-[11px] text-slate-500 font-normal mt-0.5">{q.subTopic}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
                              {q.topic}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                q.difficulty === 'Easy'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : q.difficulty === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{q.platform}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingQuestion(q);
                                  setQuestionForm({
                                    title: q.title,
                                    problemUrl: q.problemUrl,
                                    platform: q.platform || 'LeetCode',
                                    topic: q.topic,
                                    subTopic: q.subTopic || '',
                                    difficulty: q.difficulty,
                                    tags: Array.isArray(q.tags) ? q.tags.join(', ') : '',
                                    order: q.order || idx + 1,
                                  });
                                  setIsAddQuestionModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Edit Question"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove "${q.title}" from the Must-to-Do Sheet? Associated progress records will be cleaned.`)) {
                                    deleteQuestionMutation.mutate(q._id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userRole}
                  onChange={(e) => {
                    setUserRole(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={userStatus}
                  onChange={(e) => {
                    setUserStatus(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>

            {usersLoading ? (
              <div className="py-20 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {usersList.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>
                            <p>{user.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              user.role === 'admin'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : user.role === 'faculty'
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{user.department || '—'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              user.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setSelectedRole(user.role);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
                              title="Modify Role"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateUserMutation.mutate({
                                  userId: user._id,
                                  data: { isActive: !user.isActive },
                                })
                              }
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.isActive
                                  ? 'text-rose-400 hover:bg-rose-500/10'
                                  : 'text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={user.isActive ? 'Suspend User' : 'Reactivate User'}
                            >
                              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Page {userPagination.page} of {userPagination.totalPages} ({userPagination.total} Users)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  disabled={userPage === 1}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setUserPage((p) => Math.min(userPagination.totalPages, p + 1))}
                  disabled={userPage >= userPagination.totalPages}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSE MODERATION */}
        {activeTab === 'courses' && (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search course title or code..."
                  value={courseSearch}
                  onChange={(e) => {
                    setCourseSearch(e.target.value);
                    setCoursePage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={courseStatus}
                onChange={(e) => {
                  setCourseStatus(e.target.value);
                  setCoursePage(1);
                }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {coursesLoading ? (
              <div className="py-20 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Enrollment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {coursesList.map((course) => (
                      <tr key={course._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>
                            <p>{course.title}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{course.code}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{course.instructor?.name || 'Faculty'}</td>
                        <td className="py-3 px-4 text-slate-400">{course.department}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {course.enrolledStudents?.length || 0} / {course.capacity}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={course.status}
                            onChange={(e) =>
                              updateCourseMutation.mutate({
                                courseId: course._id,
                                data: { status: e.target.value },
                              })
                            }
                            className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently delete "${course.title}"?`)) {
                                deleteCourseMutation.mutate(course._id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Page {coursePagination.page} of {coursePagination.totalPages} ({coursePagination.total} Courses)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCoursePage((p) => Math.max(1, p - 1))}
                  disabled={coursePage === 1}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCoursePage((p) => Math.min(coursePagination.totalPages, p + 1))}
                  disabled={coursePage >= coursePagination.totalPages}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECT MODERATION */}
        {activeTab === 'projects' && (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search project title..."
                  value={projectSearch}
                  onChange={(e) => {
                    setProjectSearch(e.target.value);
                    setProjectPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={projectStatus}
                onChange={(e) => {
                  setProjectStatus(e.target.value);
                  setProjectPage(1);
                }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
              >
                <option value="">All Statuses</option>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {projectsLoading ? (
              <div className="py-20 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Members</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {projectsList.map((project) => (
                      <tr key={project._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>
                            <p>{project.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{project.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{project.owner?.name || 'Owner'}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono">{project.members?.length || 1}</td>
                        <td className="py-3 px-4">
                          <select
                            value={project.status}
                            onChange={(e) =>
                              updateProjectMutation.mutate({
                                projectId: project._id,
                                data: { status: e.target.value },
                              })
                            }
                            className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                          >
                            <option value="PLANNING">Planning</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Permanently delete project "${project.title}"?`)) {
                                deleteProjectMutation.mutate(project._id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Page {projectPagination.page} of {projectPagination.totalPages} ({projectPagination.total} Projects)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setProjectPage((p) => Math.max(1, p - 1))}
                  disabled={projectPage === 1}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setProjectPage((p) => Math.min(projectPagination.totalPages, p + 1))}
                  disabled={projectPage >= projectPagination.totalPages}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM REPORTS & AUDIT */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Cross-Platform Activities */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Recent Platform Activity Stream</span>
              </h2>

              {reportsLoading ? (
                <div className="py-12 flex justify-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              ) : reports.recentActivities.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No recent activities logged.</p>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {reports.recentActivities.map((act) => (
                    <div
                      key={act._id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white">{act.user?.name || 'System User'}</span>{' '}
                        <span className="text-slate-400 font-mono">({act.action})</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{act.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Registrations */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Recently Registered Users</span>
              </h2>

              {reportsLoading ? (
                <div className="py-12 flex justify-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              ) : reports.recentUsers.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No recent users.</p>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {reports.recentUsers.map((ru) => (
                    <div
                      key={ru._id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white">{ru.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{ru.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {ru.role}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(ru.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT QUESTION */}
        {isAddQuestionModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  <span>{editingQuestion ? 'Edit DSA Question' : 'Add Question to Must-to-Do Sheet'}</span>
                </h3>
                <button onClick={() => setIsAddQuestionModalOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Question Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Two Sum"
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Problem URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://leetcode.com/problems/two-sum/"
                    value={questionForm.problemUrl}
                    onChange={(e) => setQuestionForm({ ...questionForm, problemUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Platform</label>
                    <select
                      value={questionForm.platform}
                      onChange={(e) => setQuestionForm({ ...questionForm, platform: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Topic *</label>
                    <select
                      value={questionForm.topic}
                      onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subtopic</label>
                    <input
                      type="text"
                      placeholder="e.g. Hash Map"
                      value={questionForm.subTopic}
                      onChange={(e) => setQuestionForm({ ...questionForm, subTopic: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Order #</label>
                    <input
                      type="number"
                      min={1}
                      value={questionForm.order}
                      onChange={(e) => setQuestionForm({ ...questionForm, order: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Array, Hash Table, Amazon, Meta"
                    value={questionForm.tags}
                    onChange={(e) => setQuestionForm({ ...questionForm, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddQuestionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addQuestionMutation.isPending || updateQuestionMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                  >
                    {(addQuestionMutation.isPending || updateQuestionMutation.isPending) && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>{editingQuestion ? 'Update Question' : 'Save Question'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT SHEET TITLE / DESCRIPTION */}
        {isEditSheetModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Edit Must-to-Do Sheet Metadata</h3>
                <button onClick={() => setIsEditSheetModalOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSheetMetadataMutation.mutate(sheetForm);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sheet Title</label>
                  <input
                    type="text"
                    required
                    value={sheetForm.title}
                    onChange={(e) => setSheetForm({ ...sheetForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={sheetForm.description}
                    onChange={(e) => setSheetForm({ ...sheetForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditSheetModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateSheetMetadataMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    {updateSheetMetadataMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Metadata</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT USER ROLE */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900 max-w-sm w-full space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white">Modify User Role</h3>
              <p className="text-xs text-slate-400">
                Change system privileges for <span className="text-white font-bold">{editingUser.name}</span>.
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  Select New Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    updateUserMutation.mutate({
                      userId: editingUser._id,
                      data: { role: selectedRole },
                    })
                  }
                  disabled={updateUserMutation.isPending}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
                >
                  {updateUserMutation.isPending ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
