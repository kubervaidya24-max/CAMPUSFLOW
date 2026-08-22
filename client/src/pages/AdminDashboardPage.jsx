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
} from 'lucide-react';
import { adminService } from '../services/adminService';

export const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'courses', 'projects', 'reports'

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

  // 5. Fetch Reports
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
                Centralized governance, user suspension, content moderation, and platform security.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800">
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
          <div className="p-4 rounded-2xl bg-slate-900 border border-sky-500/20 text-center">
            <span className="text-[10px] font-bold text-sky-400 uppercase">Courses</span>
            <p className="text-2xl font-black text-sky-300 mt-1">{stats.academics.totalCourses}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 text-center">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Projects</span>
            <p className="text-2xl font-black text-amber-300 mt-1">{stats.projects.totalProjects}</p>
          </div>
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-4">
            {/* Filters Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={userRole}
                  onChange={(e) => {
                    setUserRole(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admins</option>
                </select>

                <select
                  value={userStatus}
                  onChange={(e) => {
                    setUserStatus(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {usersLoading ? (
              <div className="py-16 flex items-center justify-center gap-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="text-xs">Loading user directory...</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="p-3.5 font-bold">User</th>
                      <th className="p-3.5 font-bold">Role</th>
                      <th className="p-3.5 font-bold">Department</th>
                      <th className="p-3.5 font-bold">Account Status</th>
                      <th className="p-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No users matched the criteria.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => {
                        const isSuspended = u.isActive === false;
                        return (
                          <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5">
                              <div>
                                <p className="font-bold text-white">{u.name}</p>
                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                  u.role === 'admin'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : u.role === 'faculty'
                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-300">
                              {u.profile?.department || '—'}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                  isSuspended
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}
                              >
                                {isSuspended ? (
                                  <>
                                    <UserX className="w-3 h-3" /> Suspended
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" /> Active
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              {/* Edit Role */}
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setSelectedRole(u.role);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                                title="Change Role"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Suspend/Activate */}
                              <button
                                onClick={() =>
                                  updateUserMutation.mutate({
                                    userId: u._id,
                                    data: { isActive: isSuspended },
                                  })
                                }
                                disabled={updateUserMutation.isPending}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  isSuspended
                                    ? 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {isSuspended ? 'Reactivate' : 'Suspend'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Page {userPagination.page} of {userPagination.totalPages} ({userPagination.total} Total Users)
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
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search course title or code..."
                  value={courseSearch}
                  onChange={(e) => {
                    setCourseSearch(e.target.value);
                    setCoursePage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={courseStatus}
                onChange={(e) => {
                  setCourseStatus(e.target.value);
                  setCoursePage(1);
                }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 w-full sm:w-auto"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {coursesLoading ? (
              <div className="py-16 flex items-center justify-center gap-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="text-xs">Loading courses...</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="p-3.5 font-bold">Course</th>
                      <th className="p-3.5 font-bold">Faculty</th>
                      <th className="p-3.5 font-bold">Status</th>
                      <th className="p-3.5 font-bold">Enrolled</th>
                      <th className="p-3.5 font-bold text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {coursesList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No courses found.
                        </td>
                      </tr>
                    ) : (
                      coursesList.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div>
                              <p className="font-bold text-white">{c.title}</p>
                              <span className="text-[10px] font-mono text-indigo-400 uppercase">
                                {c.code} • {c.department}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-300">{c.faculty?.name || 'Unassigned'}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                c.status === 'published'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono">
                            {c.enrolledStudents?.length || 0}
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {/* Toggle Status */}
                            <button
                              onClick={() =>
                                updateCourseMutation.mutate({
                                  courseId: c._id,
                                  data: { status: c.status === 'published' ? 'archived' : 'published' },
                                })
                              }
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                            >
                              {c.status === 'published' ? 'Archive' : 'Publish'}
                            </button>

                            {/* Delete Course */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete course "${c.title}" and its assignments?`)) {
                                  deleteCourseMutation.mutate(c._id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                              title="Delete Course"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search project title or description..."
                  value={projectSearch}
                  onChange={(e) => {
                    setProjectSearch(e.target.value);
                    setProjectPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={projectStatus}
                onChange={(e) => {
                  setProjectStatus(e.target.value);
                  setProjectPage(1);
                }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 w-full sm:w-auto"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {projectsLoading ? (
              <div className="py-16 flex items-center justify-center gap-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="text-xs">Loading projects...</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="p-3.5 font-bold">Project</th>
                      <th className="p-3.5 font-bold">Lead / Owner</th>
                      <th className="p-3.5 font-bold">Status</th>
                      <th className="p-3.5 font-bold">Members</th>
                      <th className="p-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {projectsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No projects found.
                        </td>
                      </tr>
                    ) : (
                      projectsList.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div>
                              <p className="font-bold text-white">{p.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-300">{p.owner?.name || 'Unknown'}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                p.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono">{p.members?.length || 1}</td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() =>
                                updateProjectMutation.mutate({
                                  projectId: p._id,
                                  data: { status: p.status === 'active' ? 'completed' : 'active' },
                                })
                              }
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                            >
                              {p.status === 'active' ? 'Mark Completed' : 'Activate'}
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Delete project "${p.title}" and its tasks?`)) {
                                  deleteProjectMutation.mutate(p._id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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

        {/* Edit Role Modal */}
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
