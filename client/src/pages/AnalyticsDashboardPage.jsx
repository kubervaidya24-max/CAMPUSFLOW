import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  FolderGit2,
  Briefcase,
  Flame,
  Award,
  TrendingUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

export const AnalyticsDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'academic', 'projects', 'career'

  const {
    data: studentAnalyticsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['studentAnalytics'],
    queryFn: () => analyticsService.getStudentAnalytics(),
  });

  const analytics = studentAnalyticsData?.data?.data || studentAnalyticsData?.data || {
    academic: { enrolledCourses: 0, totalCredits: 0, departmentDistribution: [] },
    assignments: {
      totalAssignments: 0,
      submittedCount: 0,
      gradedCount: 0,
      onTimeCount: 0,
      lateCount: 0,
      completionRate: 0,
      averageGradePercentage: 0,
      statusBreakdown: [],
    },
    projects: {
      totalProjects: 0,
      ownedProjects: 0,
      collaboratingProjects: 0,
      tasks: { totalAssigned: 0, completed: 0, inProgress: 0, todo: 0, completionRate: 0, byPriority: [] },
    },
    career: {
      dsa: { totalTracked: 0, solvedCount: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, completionPercentage: 0, byTopic: [] },
      jobs: { totalApplications: 0, activePipeline: 0, interviewCount: 0, offersReceived: 0, rejections: 0, rejectionRate: 0, offerConversionRate: 0, byStatus: [] },
    },
  };

  const { academic, assignments, projects, career } = analytics;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Data-Driven Analytics Engine
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Aggregations
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time algorithmic metrics computed directly from database records without estimation.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Selector & Refetch */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('academic')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'academic'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Academics
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'projects'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('career')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'career'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Career & DSA
              </button>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Loading State */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs font-medium">Computing aggregation pipelines...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top KPI Scorecards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Academic Velocity */}
              <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-slate-900/90 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Academic Credits
                  </span>
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-white">{academic.totalCredits}</span>
                  <span className="text-xs text-slate-400">
                    in {academic.enrolledCourses} Course{academic.enrolledCourses === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Card 2: Assignment Score */}
              <div className="glass-panel p-5 rounded-2xl border border-sky-500/20 bg-slate-900/90 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    Avg Assignment Grade
                  </span>
                  <Award className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-white">{assignments.averageGradePercentage}%</span>
                  <span className="text-xs text-slate-400">
                    ({assignments.gradedCount} Graded)
                  </span>
                </div>
              </div>

              {/* Card 3: Project Task Completion */}
              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-slate-900/90 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Task Velocity
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-white">{projects.tasks.completionRate}%</span>
                  <span className="text-xs text-slate-400">
                    ({projects.tasks.completed}/{projects.tasks.totalAssigned} Done)
                  </span>
                </div>
              </div>

              {/* Card 4: Career & Job Offers */}
              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-slate-900/90 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Job Offers & Pipeline
                  </span>
                  <Briefcase className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-white">{career.jobs.offersReceived}</span>
                  <span className="text-xs text-slate-400">
                    Offers ({career.jobs.activePipeline} Active)
                  </span>
                </div>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Overall Health & Progress Summary (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Holistic Progress Bar */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                          Deliverable & Execution Velocity
                        </h2>
                      </div>
                      <span className="text-xs text-indigo-400 font-bold">
                        {Math.round((assignments.completionRate + projects.tasks.completionRate) / 2)}% Overall
                      </span>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                          <span className="text-slate-300">Assignment Completion</span>
                          <span className="text-sky-400">{assignments.completionRate}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(assignments.completionRate, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                          <span className="text-slate-300">Project Task Completion</span>
                          <span className="text-emerald-400">{projects.tasks.completionRate}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(projects.tasks.completionRate, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                          <span className="text-slate-300">DSA Problem Completion</span>
                          <span className="text-orange-400">{career.dsa.completionPercentage}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(career.dsa.completionPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Status Distribution */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-emerald-400" />
                      <span>Task Workload Distribution</span>
                    </h2>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">To Do</span>
                        <p className="text-xl font-black text-slate-300 mt-1">{projects.tasks.todo}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/20">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">In Progress</span>
                        <p className="text-xl font-black text-indigo-300 mt-1">{projects.tasks.inProgress}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Completed</span>
                        <p className="text-xl font-black text-emerald-300 mt-1">{projects.tasks.completed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Career & Funnel Overview (5 Cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Job Application Funnel Card */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-amber-400" />
                      <span>Career Pipeline Conversion</span>
                    </h2>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <span className="text-slate-400">Total Applications</span>
                        <span className="font-bold text-white">{career.jobs.totalApplications}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-sky-500/20 text-xs">
                        <span className="text-sky-400">Active Rounds (OA / Tech / HR)</span>
                        <span className="font-bold text-sky-300">{career.jobs.activePipeline}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs">
                        <span className="text-emerald-400">Offers Secured</span>
                        <span className="font-bold text-emerald-300">{career.jobs.offersReceived}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-red-500/20 text-xs">
                        <span className="text-red-400">Rejections</span>
                        <span className="font-bold text-red-300">{career.jobs.rejections} ({career.jobs.rejectionRate}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* DSA Solved Breakdown */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>DSA Difficulty Distribution</span>
                    </h2>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Easy</span>
                        <p className="text-lg font-black text-emerald-300 mt-0.5">{career.dsa.easySolved}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-[10px] font-bold text-amber-400 uppercase">Medium</span>
                        <p className="text-lg font-black text-amber-300 mt-0.5">{career.dsa.mediumSolved}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] font-bold text-rose-400 uppercase">Hard</span>
                        <p className="text-lg font-black text-rose-300 mt-0.5">{career.dsa.hardSolved}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC & ASSIGNMENTS */}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Enrolled Courses</span>
                    <p className="text-3xl font-black text-white mt-1">{academic.enrolledCourses}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Total Active Credits</span>
                    <p className="text-3xl font-black text-indigo-300 mt-1">{academic.totalCredits}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Assignments Submitted</span>
                    <p className="text-3xl font-black text-sky-300 mt-1">
                      {assignments.submittedCount} / {assignments.totalAssignments}
                    </p>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Assignment Submission Status
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">On-Time</span>
                      <p className="text-xl font-black text-emerald-400 mt-1">{assignments.onTimeCount}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Late</span>
                      <p className="text-xl font-black text-amber-400 mt-1">{assignments.lateCount}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Graded</span>
                      <p className="text-xl font-black text-indigo-400 mt-1">{assignments.gradedCount}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Average Grade</span>
                      <p className="text-xl font-black text-sky-400 mt-1">{assignments.averageGradePercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Total Projects</span>
                    <p className="text-3xl font-black text-white mt-1">{projects.totalProjects}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">Lead / Owned</span>
                    <p className="text-3xl font-black text-indigo-300 mt-1">{projects.ownedProjects}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Collaborating</span>
                    <p className="text-3xl font-black text-emerald-300 mt-1">{projects.collaboratingProjects}</p>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Task Execution Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total Assigned</span>
                      <p className="text-xl font-black text-white mt-1">{projects.tasks.totalAssigned}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Todo</span>
                      <p className="text-xl font-black text-slate-300 mt-1">{projects.tasks.todo}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">In Progress</span>
                      <p className="text-xl font-black text-indigo-300 mt-1">{projects.tasks.inProgress}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Completed</span>
                      <p className="text-xl font-black text-emerald-300 mt-1">{projects.tasks.completed}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CAREER & PLACEMENT */}
            {activeTab === 'career' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Applications</span>
                    <p className="text-3xl font-black text-white mt-1">{career.jobs.totalApplications}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-sky-500/20 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-sky-400 uppercase">Active Rounds</span>
                    <p className="text-3xl font-black text-sky-300 mt-1">{career.jobs.activePipeline}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Job Offers 🎉</span>
                    <p className="text-3xl font-black text-emerald-300 mt-1">{career.jobs.offersReceived}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-slate-900 text-center">
                    <span className="text-[10px] font-bold text-rose-400 uppercase">Rejection Rate</span>
                    <p className="text-3xl font-black text-rose-300 mt-1">{career.jobs.rejectionRate}%</p>
                  </div>
                </div>

                {/* DSA Topic Mastery Progress */}
                {career.dsa.byTopic && career.dsa.byTopic.length > 0 && (
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      DSA Topic Mastery Distribution
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {career.dsa.byTopic.map((t, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-white">{t._id}</span>
                            <span className="text-indigo-400">
                              {t.solved} / {t.total} ({t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{
                                width: `${t.total > 0 ? (t.solved / t.total) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
