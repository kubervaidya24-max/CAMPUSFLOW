import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Code2,
  BarChart3,
  Plus,
  Flame,
  CheckCircle2,
  ExternalLink,
  Search,
  Trash2,
  Calendar,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Loader2,
  X,
  Layers,
} from 'lucide-react';
import { placementService } from '../services/placementService';

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
  'Other',
];

const PIPELINE_STAGES = [
  { key: 'APPLIED', label: 'Applied', color: 'border-sky-500/30 text-sky-400 bg-sky-500/10' },
  { key: 'OA', label: 'Online Assessment', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' },
  { key: 'TECHNICAL', label: 'Technical Interview', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { key: 'HR', label: 'HR Round', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  { key: 'OFFER', label: 'Job Offer 🎉', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  { key: 'REJECTED', label: 'Archived / Rejected', color: 'border-slate-700 text-slate-500 bg-slate-900/50' },
];

export const PlacementPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dsa'); // 'dsa' | 'jobs' | 'analytics'

  // DSA Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [isDSAModalOpen, setIsDSAModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Form States
  const [dsaForm, setDsaForm] = useState({
    title: '',
    platform: 'LeetCode',
    problemUrl: '',
    topic: 'Arrays',
    difficulty: 'Easy',
    status: 'Solved',
    notes: '',
    rating: 3,
  });

  const [jobForm, setJobForm] = useState({
    company: '',
    role: '',
    location: '',
    jobType: 'Full-time',
    salary: '',
    status: 'APPLIED',
    interviewDate: '',
    jobUrl: '',
    notes: '',
  });

  // ==========================================
  // QUERIES
  // ==========================================

  // 1. DSA Problems
  const { data: dsaData, isLoading: isDSALoading } = useQuery({
    queryKey: ['dsaProblems', selectedTopic, selectedDifficulty, selectedStatus, searchQuery],
    queryFn: () =>
      placementService.getDSAProblems({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        status: selectedStatus,
        search: searchQuery,
      }),
  });

  // 2. DSA Analytics
  const { data: dsaAnalyticsData } = useQuery({
    queryKey: ['dsaAnalytics'],
    queryFn: () => placementService.getDSAAnalytics(),
  });

  // 3. Job Pipeline
  const { data: jobPipelineData, isLoading: isJobLoading } = useQuery({
    queryKey: ['jobPipeline'],
    queryFn: () => placementService.getJobPipeline(),
  });

  const dsaProblems = dsaData?.data?.data?.problems || dsaData?.data?.problems || [];
  const analytics = dsaAnalyticsData?.data?.data || dsaAnalyticsData?.data || {
    summary: { totalProblems: 0, solvedCount: 0, completionPercentage: 0, currentStreak: 0 },
    byDifficulty: { Easy: { solved: 0, total: 0 }, Medium: { solved: 0, total: 0 }, Hard: { solved: 0, total: 0 } },
    byTopic: [],
    byPlatform: [],
  };
  const pipeline = jobPipelineData?.data?.data?.pipeline || jobPipelineData?.data?.pipeline || {
    APPLIED: [],
    OA: [],
    TECHNICAL: [],
    HR: [],
    OFFER: [],
    REJECTED: [],
  };
  const jobSummary = jobPipelineData?.data?.data?.summary || jobPipelineData?.data?.summary || { total: 0, active: 0, offers: 0, interviews: 0 };

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Add DSA Problem
  const addDSAMutation = useMutation({
    mutationFn: (data) => placementService.createDSAProblem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblems'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
      setIsDSAModalOpen(false);
      setDsaForm({
        title: '',
        platform: 'LeetCode',
        problemUrl: '',
        topic: 'Arrays',
        difficulty: 'Easy',
        status: 'Solved',
        notes: '',
        rating: 3,
      });
    },
  });

  // Update DSA Status
  const updateDSAStatusMutation = useMutation({
    mutationFn: ({ id, status }) => placementService.updateDSAProblem(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblems'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
    },
  });

  // Delete DSA Problem
  const deleteDSAMutation = useMutation({
    mutationFn: (id) => placementService.deleteDSAProblem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblems'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
    },
  });

  // Add Job Application
  const addJobMutation = useMutation({
    mutationFn: (data) => placementService.createJobApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPipeline'] });
      setIsJobModalOpen(false);
      setJobForm({
        company: '',
        role: '',
        location: '',
        jobType: 'Full-time',
        salary: '',
        status: 'APPLIED',
        interviewDate: '',
        jobUrl: '',
        notes: '',
      });
    },
  });

  // Update Job Stage
  const updateJobStageMutation = useMutation({
    mutationFn: ({ id, status }) => placementService.updateJobApplication(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPipeline'] });
    },
  });

  // Delete Job Application
  const deleteJobMutation = useMutation({
    mutationFn: (id) => placementService.deleteJobApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPipeline'] });
    },
  });

  // Handlers
  const handleSaveDSA = (e) => {
    e.preventDefault();
    if (!dsaForm.title.trim()) return;
    addDSAMutation.mutate(dsaForm);
  };

  const handleSaveJob = (e) => {
    e.preventDefault();
    if (!jobForm.company.trim() || !jobForm.role.trim()) return;
    addJobMutation.mutate(jobForm);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  const getNextStage = (currentStatus) => {
    switch (currentStatus) {
      case 'APPLIED':
        return 'OA';
      case 'OA':
        return 'TECHNICAL';
      case 'TECHNICAL':
        return 'HR';
      case 'HR':
        return 'OFFER';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Tabs */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                <Briefcase className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Placement & Career Engine
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Track algorithm mastery, solve daily streaks, and manage your full-cycle job application pipeline.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('dsa')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dsa'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>DSA Practice</span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'jobs'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Application Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* TAB 1: DSA PRACTICE TRACKER */}
        {/* ========================================== */}
        {activeTab === 'dsa' && (
          <div className="space-y-6">
            {/* Streak & Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Daily Streak Card */}
              <div className="glass-panel p-5 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-slate-900 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                    Daily Streak
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span data-testid="daily-streak-count" className="text-3xl font-black text-white">
                      {analytics.summary?.currentStreak || 0}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Days</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 animate-pulse">
                  <Flame className="w-7 h-7 fill-orange-500/20" />
                </div>
              </div>

              {/* Total Solved Card */}
              <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-slate-900 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    Problems Solved
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-white">
                      {analytics.summary?.solvedCount || 0}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / {analytics.summary?.totalProblems || 0} ({analytics.summary?.completionPercentage || 0}%)
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              {/* Easy / Medium / Hard Pill Breakdown */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl col-span-1 sm:col-span-2 flex items-center justify-around gap-2">
                <div className="text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Easy
                  </span>
                  <p className="text-xl font-bold text-white mt-1">
                    {analytics.byDifficulty?.Easy?.solved || 0}
                    <span className="text-xs text-slate-500 font-normal">
                      /{analytics.byDifficulty?.Easy?.total || 0}
                    </span>
                  </p>
                </div>

                <div className="h-8 w-[1px] bg-slate-800" />

                <div className="text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Medium
                  </span>
                  <p className="text-xl font-bold text-white mt-1">
                    {analytics.byDifficulty?.Medium?.solved || 0}
                    <span className="text-xs text-slate-500 font-normal">
                      /{analytics.byDifficulty?.Medium?.total || 0}
                    </span>
                  </p>
                </div>

                <div className="h-8 w-[1px] bg-slate-800" />

                <div className="text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Hard
                  </span>
                  <p className="text-xl font-bold text-white mt-1">
                    {analytics.byDifficulty?.Hard?.solved || 0}
                    <span className="text-xs text-slate-500 font-normal">
                      /{analytics.byDifficulty?.Hard?.total || 0}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Bar & Add Problem Button */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search problem title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Topic Filter */}
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Topics</option>
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Solved">Solved</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Revisit">Revisit</option>
                </select>
              </div>

              <button
                onClick={() => setIsDSAModalOpen(true)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Record Problem</span>
              </button>
            </div>

            {/* Problem List Table */}
            <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
              {isDSALoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <span className="text-xs">Loading DSA records...</span>
                </div>
              ) : dsaProblems.length === 0 ? (
                <div className="py-16 text-center text-slate-500 p-6">
                  <Code2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <h3 className="text-sm font-bold text-slate-300">No Problems Recorded Yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Start tracking your DSA journey. Click &quot;Record Problem&quot; above to log your solved questions.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Problem</th>
                        <th className="py-3.5 px-4">Topic</th>
                        <th className="py-3.5 px-4">Difficulty</th>
                        <th className="py-3.5 px-4">Platform</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {dsaProblems.map((prob) => (
                        <tr key={prob._id} className="hover:bg-slate-900/50 transition-colors">
                          {/* Title & Link */}
                          <td className="py-3 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span>{prob.title}</span>
                              {prob.problemUrl && (
                                <a
                                  href={prob.problemUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            {prob.notes && (
                              <p className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                                {prob.notes}
                              </p>
                            )}
                          </td>

                          {/* Topic */}
                          <td className="py-3 px-4 text-slate-300">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
                              {prob.topic}
                            </span>
                          </td>

                          {/* Difficulty */}
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(
                                prob.difficulty
                              )}`}
                            >
                              {prob.difficulty}
                            </span>
                          </td>

                          {/* Platform */}
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {prob.platform}
                          </td>

                          {/* Status Toggle */}
                          <td className="py-3 px-4">
                            <select
                              value={prob.status}
                              onChange={(e) =>
                                updateDSAStatusMutation.mutate({
                                  id: prob._id,
                                  status: e.target.value,
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${
                                prob.status === 'Solved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : prob.status === 'In Progress'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              <option value="Todo">Todo</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Solved">Solved</option>
                              <option value="Revisit">Revisit</option>
                            </select>
                          </td>

                          {/* Delete */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => deleteDSAMutation.mutate(prob._id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete entry"
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
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: JOB APPLICATION PIPELINE */}
        {/* ========================================== */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Pipeline Metrics Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Applications
                </span>
                <p className="text-2xl font-black text-white mt-0.5">{jobSummary.total}</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 bg-slate-900">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  Active Pipeline
                </span>
                <p className="text-2xl font-black text-sky-300 mt-0.5">{jobSummary.active}</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 bg-slate-900">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Interviews
                </span>
                <p className="text-2xl font-black text-purple-300 mt-0.5">{jobSummary.interviews}</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-slate-900">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Offers Received 🎉
                </span>
                <p className="text-2xl font-black text-emerald-300 mt-0.5">{jobSummary.offers}</p>
              </div>
            </div>

            {/* Action Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Visual Application Pipeline
                </h2>
                <p className="text-xs text-slate-500">
                  Track stages from initial submission to technical rounds and offers.
                </p>
              </div>

              <button
                onClick={() => setIsJobModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Track Application</span>
              </button>
            </div>

            {/* Visual Pipeline Columns */}
            {isJobLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-xs">Loading application pipeline...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
                {PIPELINE_STAGES.map((stage) => {
                  const items = pipeline[stage.key] || [];

                  return (
                    <div
                      key={stage.key}
                      className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3 min-h-[350px] flex flex-col"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/70 mb-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.color}`}
                        >
                          {stage.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {items.length}
                        </span>
                      </div>

                      {/* Cards Container */}
                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {items.length === 0 ? (
                          <div className="py-8 text-center text-slate-600 text-[11px] italic">
                            Empty
                          </div>
                        ) : (
                          items.map((app) => {
                            const next = getNextStage(app.status);

                            return (
                              <div
                                key={app._id}
                                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-md group relative"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                                    {app.company}
                                  </h4>
                                  <button
                                    onClick={() => deleteJobMutation.mutate(app._id)}
                                    className="text-slate-600 hover:text-rose-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete application"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                                  {app.role}
                                </p>

                                {app.salary && (
                                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono mt-1.5">
                                    <DollarSign className="w-3 h-3" />
                                    <span>{app.salary}</span>
                                  </div>
                                )}

                                {app.interviewDate && (
                                  <div className="flex items-center gap-1 text-[10px] text-purple-400 font-medium mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(app.interviewDate).toLocaleDateString()}</span>
                                  </div>
                                )}

                                {/* Next Stage Action */}
                                {next && (
                                  <button
                                    onClick={() =>
                                      updateJobStageMutation.mutate({
                                        id: app._id,
                                        status: next,
                                      })
                                    }
                                    className="w-full mt-2.5 py-1 px-2 rounded-lg bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/30 text-[10px] font-bold text-indigo-300 flex items-center justify-center gap-1 transition-all"
                                  >
                                    <span>Advance to {next}</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: ANALYTICS OVERVIEW */}
        {/* ========================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Topic Mastery Progress Bars */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Topic Mastery Breakdown</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(analytics.byTopic || []).map((topicItem) => (
                  <div
                    key={topicItem.topic}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{topicItem.topic}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {topicItem.solved} / {topicItem.total} ({topicItem.percentage}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800/50">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
                        style={{ width: `${topicItem.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL: ADD DSA PROBLEM */}
        {/* ========================================== */}
        {isDSAModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  <span>Record DSA Problem</span>
                </h3>
                <button
                  onClick={() => setIsDSAModalOpen(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDSA} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trapping Rain Water"
                    value={dsaForm.title}
                    onChange={(e) => setDsaForm({ ...dsaForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
                    <select
                      value={dsaForm.topic}
                      onChange={(e) => setDsaForm({ ...dsaForm, topic: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={dsaForm.difficulty}
                      onChange={(e) => setDsaForm({ ...dsaForm, difficulty: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Platform
                    </label>
                    <select
                      value={dsaForm.platform}
                      onChange={(e) => setDsaForm({ ...dsaForm, platform: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                    <select
                      value={dsaForm.status}
                      onChange={(e) => setDsaForm({ ...dsaForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Solved">Solved</option>
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Revisit">Revisit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Problem Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://leetcode.com/problems/..."
                    value={dsaForm.problemUrl}
                    onChange={(e) => setDsaForm({ ...dsaForm, problemUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notes & Approach
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Key edge cases, time/space complexity..."
                    value={dsaForm.notes}
                    onChange={(e) => setDsaForm({ ...dsaForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDSAModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addDSAMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                  >
                    {addDSAMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Problem</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL: ADD JOB APPLICATION */}
        {/* ========================================== */}
        {isJobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <span>Track Job Application</span>
                </h3>
                <button
                  onClick={() => setIsJobModalOpen(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      value={jobForm.company}
                      onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Role *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineer"
                      value={jobForm.role}
                      onChange={(e) => setJobForm({ ...jobForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore / Remote"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Compensation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24 LPA"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Stage</label>
                    <select
                      value={jobForm.status}
                      onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="OA">Online Assessment</option>
                      <option value="TECHNICAL">Technical Interview</option>
                      <option value="HR">HR Round</option>
                      <option value="OFFER">Job Offer</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Interview Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={jobForm.interviewDate}
                      onChange={(e) => setJobForm({ ...jobForm, interviewDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Posting Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={jobForm.jobUrl}
                    onChange={(e) => setJobForm({ ...jobForm, jobUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsJobModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addJobMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                  >
                    {addJobMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Application</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementPage;
