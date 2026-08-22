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
  Sparkles,
  Star,
  Clock,
  Award,
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
  'CodeStudio',
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
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet' | 'dsa' | 'jobs' | 'analytics'

  // Must-to-Do DSA Sheet Filters
  const [sheetSearch, setSheetSearch] = useState('');
  const [sheetTopic, setSheetTopic] = useState('All');
  const [sheetDifficulty, setSheetDifficulty] = useState('All');
  const [sheetPlatform, setSheetPlatform] = useState('All');
  const [sheetStatus, setSheetStatus] = useState('All');

  // Personal DSA Filters
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

  // 1. Must-to-Do DSA Sheet
  const { data: mustDoData, isLoading: isSheetLoading } = useQuery({
    queryKey: ['mustDoSheet', sheetTopic, sheetDifficulty, sheetPlatform, sheetStatus, sheetSearch],
    queryFn: () =>
      placementService.getMustDoSheet({
        topic: sheetTopic,
        difficulty: sheetDifficulty,
        platform: sheetPlatform,
        status: sheetStatus,
        search: sheetSearch,
      }),
  });

  // 2. Personal DSA Problems
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

  // 3. DSA Analytics
  const { data: dsaAnalyticsData } = useQuery({
    queryKey: ['dsaAnalytics'],
    queryFn: () => placementService.getDSAAnalytics(),
  });

  // 4. Job Pipeline
  const { data: pipelineData, isLoading: isPipelineLoading } = useQuery({
    queryKey: ['jobPipeline'],
    queryFn: () => placementService.getJobPipeline(),
  });

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Update Must-to-Do Sheet Question Progress
  const updateSheetProgressMutation = useMutation({
    mutationFn: ({ questionId, status, notes }) =>
      placementService.updateQuestionProgress(questionId, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mustDoSheet'] });
    },
  });

  // Add Personal DSA Problem
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

  // Update Personal DSA Status
  const updateDSAStatusMutation = useMutation({
    mutationFn: ({ id, status }) => placementService.updateDSAProblem(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblems'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
    },
  });

  // Delete Personal DSA Problem
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

  const dsaProblems = dsaData?.data?.data?.problems || dsaData?.data?.problems || [];
  const analytics = dsaAnalyticsData?.data?.data || dsaAnalyticsData?.data || { summary: {}, difficulty: {}, topicMastery: [] };
  const pipeline = pipelineData?.data?.data || pipelineData?.data || { stages: {}, metrics: {} };

  // Must-to-Do Sheet Data parsing
  const sheetPayload = mustDoData?.data?.data || mustDoData?.data || {};
  const isSheetPublished = sheetPayload.isPublished;
  const sheetQuestions = sheetPayload.questions || [];
  const sheetStats = sheetPayload.stats || {
    totalQuestions: 0,
    solvedCount: 0,
    attemptedCount: 0,
    completionPercentage: 0,
    topicBreakdown: [],
    difficultyBreakdown: { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } },
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
              Master algorithm patterns, conquer the curated Must-to-Do DSA Sheet, and manage your job pipeline.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'sheet'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
              <span>⭐ Must-to-Do DSA Sheet</span>
            </button>

            <button
              onClick={() => setActiveTab('dsa')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dsa'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Personal DSA Problems</span>
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
        {/* TAB 0: ⭐ MUST-TO-DO DSA SHEET */}
        {/* ========================================== */}
        {activeTab === 'sheet' && (
          <div className="space-y-6">
            {/* Must-to-Do Hero & Progress Scorecard */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-indigo-950/20 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Curated Curriculum
                    </span>
                    {isSheetPublished ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                        Live Sheet
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                        Draft / Unpublished
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {sheetPayload.sheet?.title || 'Must-to-Do DSA Core Sheet'}
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    {sheetPayload.sheet?.description ||
                      'Master the most critical algorithmic patterns and core data structures required by top tech engineering interviews.'}
                  </p>
                </div>

                {/* Scorecard Mini Box */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4 self-start md:self-auto shadow-inner">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Your Progress
                    </span>
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="text-2xl font-black text-amber-400">{sheetStats.solvedCount}</span>
                      <span className="text-xs font-bold text-slate-500">/ {sheetStats.totalQuestions}</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-amber-400">
                    <span className="text-sm font-black">{sheetStats.completionPercentage}%</span>
                    <span className="text-[9px] font-bold uppercase text-slate-400">Solved</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Mastery Completion</span>
                  <span className="text-amber-400">{sheetStats.solvedCount} of {sheetStats.totalQuestions} Problems Solved ({sheetStats.completionPercentage}%)</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${Math.min(sheetStats.completionPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Difficulty Breakdown Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-300">Easy</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {sheetStats.difficultyBreakdown?.Easy?.solved || 0} / {sheetStats.difficultyBreakdown?.Easy?.total || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-slate-300">Medium</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">
                    {sheetStats.difficultyBreakdown?.Medium?.solved || 0} / {sheetStats.difficultyBreakdown?.Medium?.total || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="text-xs font-bold text-slate-300">Hard</span>
                  </div>
                  <span className="text-xs font-bold text-rose-400">
                    {sheetStats.difficultyBreakdown?.Hard?.solved || 0} / {sheetStats.difficultyBreakdown?.Hard?.total || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* If Unpublished State */}
            {!isSheetPublished && (
              <div className="glass-panel p-10 rounded-3xl border border-amber-500/30 text-center space-y-3 bg-slate-900/60">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Must-to-Do DSA Sheet Under Curation</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  The Admin team is currently finalizing the problem list for this cohort. Once published, you will be able to track your solutions and pattern mastery here.
                </p>
              </div>
            )}

            {/* If Published: Sheet Filters & Questions Table */}
            {isSheetPublished && (
              <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                {/* Filter Bar */}
                <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search Must-to-Do questions by title, subtopic, or tag..."
                      value={sheetSearch}
                      onChange={(e) => setSheetSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Dropdown Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Topic Filter */}
                    <select
                      value={sheetTopic}
                      onChange={(e) => setSheetTopic(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
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
                      value={sheetDifficulty}
                      onChange={(e) => setSheetDifficulty(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="All">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>

                    {/* Platform Filter */}
                    <select
                      value={sheetPlatform}
                      onChange={(e) => setSheetPlatform(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="All">All Platforms</option>
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>

                    {/* Status Filter */}
                    <select
                      value={sheetStatus}
                      onChange={(e) => setSheetStatus(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="ATTEMPTED">Attempted</option>
                      <option value="SOLVED">Solved</option>
                    </select>
                  </div>
                </div>

                {/* Loading State */}
                {isSheetLoading && (
                  <div className="py-20 text-center text-slate-500 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                    <p className="text-xs">Loading Must-to-Do DSA Sheet...</p>
                  </div>
                )}

                {/* Empty Filter State */}
                {!isSheetLoading && sheetQuestions.length === 0 && (
                  <div className="py-20 text-center text-slate-500 space-y-3">
                    <Award className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="text-sm font-semibold text-slate-300">No questions found</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try adjusting your search keywords or clearing topic, difficulty, and status filters.
                    </p>
                  </div>
                )}

                {/* Questions Table */}
                {!isSheetLoading && sheetQuestions.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">#</th>
                          <th className="py-3 px-4">Question</th>
                          <th className="py-3 px-4">Topic</th>
                          <th className="py-3 px-4">Difficulty</th>
                          <th className="py-3 px-4">Platform</th>
                          <th className="py-3 px-4">Your Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {sheetQuestions.map((q, idx) => (
                          <tr
                            key={q._id}
                            className={`hover:bg-slate-900/60 transition-colors ${
                              q.userStatus === 'SOLVED'
                                ? 'bg-emerald-950/10'
                                : q.userStatus === 'ATTEMPTED'
                                ? 'bg-amber-950/10'
                                : ''
                            }`}
                          >
                            {/* Order # */}
                            <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                              {q.order || idx + 1}
                            </td>

                            {/* Title & Tags */}
                            <td className="py-3 px-4 font-semibold text-white">
                              <div className="flex items-center gap-2">
                                <span>{q.title}</span>
                              </div>
                              {q.subTopic && (
                                <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                                  {q.subTopic}
                                </p>
                              )}
                              {q.tags && q.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {q.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>

                            {/* Topic */}
                            <td className="py-3 px-4 text-slate-300">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
                                {q.topic}
                              </span>
                            </td>

                            {/* Difficulty */}
                            <td className="py-3 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(
                                  q.difficulty
                                )}`}
                              >
                                {q.difficulty}
                              </span>
                            </td>

                            {/* Platform */}
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {q.platform}
                            </td>

                            {/* User Status Control */}
                            <td className="py-3 px-4">
                              <select
                                value={q.userStatus || 'NOT_STARTED'}
                                onChange={(e) =>
                                  updateSheetProgressMutation.mutate({
                                    questionId: q._id,
                                    status: e.target.value,
                                  })
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${
                                  q.userStatus === 'SOLVED'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : q.userStatus === 'ATTEMPTED'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    : 'bg-slate-900 text-slate-400 border-slate-800'
                                }`}
                              >
                                <option value="NOT_STARTED">○ Not Started</option>
                                <option value="ATTEMPTED">🔵 Attempted</option>
                                <option value="SOLVED">✓ Solved</option>
                              </select>
                            </td>

                            {/* Action: External Solve Link */}
                            <td className="py-3 px-4 text-right">
                              <a
                                href={q.problemUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all shadow-sm"
                                title="Open original problem in new tab"
                              >
                                <span>Solve</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
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
        )}

        {/* ========================================== */}
        {/* TAB 1: PERSONAL DSA PRACTICE TRACKER */}
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
                    Personal Solved
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-white">
                      {analytics.summary?.totalSolved || 0}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / {analytics.summary?.totalLogged || 0}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              </div>

              {/* Completion Rate */}
              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-slate-900 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Completion Rate
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-white">
                      {analytics.summary?.completionPercentage || 0}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </div>

              {/* Time Spent */}
              <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 bg-slate-900 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                    Total Time Logged
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-white">
                      {Math.round((analytics.summary?.totalTimeSpentMinutes || 0) / 60)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Hours</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <BarChart3 className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* Problem Table Card */}
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search personal problem log..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
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

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Solved">Solved</option>
                    <option value="Revisit">Revisit</option>
                  </select>

                  <button
                    onClick={() => setIsDSAModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Problem</span>
                  </button>
                </div>
              </div>

              {isDSALoading && (
                <div className="py-20 text-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                </div>
              )}

              {!isDSALoading && dsaProblems.length === 0 && (
                <div className="py-20 text-center text-slate-500 space-y-3">
                  <Code2 className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">No personal problems logged yet</p>
                  <p className="text-xs text-slate-500">
                    Click &quot;Log Problem&quot; to keep a notebook of problems you solve.
                  </p>
                </div>
              )}

              {!isDSALoading && dsaProblems.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Problem</th>
                        <th className="py-3 px-4">Topic</th>
                        <th className="py-3 px-4">Difficulty</th>
                        <th className="py-3 px-4">Platform</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {dsaProblems.map((prob) => (
                        <tr key={prob._id} className="hover:bg-slate-900/50 transition-colors">
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
                          <td className="py-3 px-4 text-slate-300">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
                              {prob.topic}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(
                                prob.difficulty
                              )}`}
                            >
                              {prob.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {prob.platform}
                          </td>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Active Recruitment Pipeline</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track full funnel from Application to Offer with interview schedules and salary insights.
                </p>
              </div>
              <button
                onClick={() => setIsJobModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Track Application</span>
              </button>
            </div>

            {/* Kanban Columns */}
            {isPipelineLoading ? (
              <div className="py-20 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {PIPELINE_STAGES.map((stage) => {
                  const stageJobs = pipeline.stages?.[stage.key] || [];
                  return (
                    <div
                      key={stage.key}
                      className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3 flex flex-col h-full min-h-[400px]"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${stage.color}`}>
                          {stage.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                          {stageJobs.length}
                        </span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                        {stageJobs.map((job) => (
                          <div
                            key={job._id}
                            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-md space-y-2 hover:border-indigo-500/40 transition-all"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <h4 className="text-xs font-bold text-white">{job.role}</h4>
                                <p className="text-[11px] text-indigo-400 font-medium">{job.company}</p>
                              </div>
                              <button
                                onClick={() => deleteJobMutation.mutate(job._id)}
                                className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {job.salary && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                <DollarSign className="w-3 h-3" />
                                <span>{job.salary}</span>
                              </div>
                            )}

                            {job.interviewDate && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(job.interviewDate).toLocaleDateString()}</span>
                              </div>
                            )}

                            {getNextStage(job.status) && (
                              <button
                                onClick={() =>
                                  updateJobStageMutation.mutate({
                                    id: job._id,
                                    status: getNextStage(job.status),
                                  })
                                }
                                className="w-full mt-2 py-1 px-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <span>Advance Stage</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}

                        {stageJobs.length === 0 && (
                          <div className="py-8 text-center text-[11px] text-slate-600 italic">
                            No applications
                          </div>
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
        {/* TAB 3: PLACEMENT & DSA ANALYTICS */}
        {/* ========================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty Breakdown Chart */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <span>Difficulty Breakdown</span>
                </h3>

                <div className="space-y-3">
                  {['Easy', 'Medium', 'Hard'].map((diff) => {
                    const data = analytics.difficulty?.[diff] || { total: 0, solved: 0, percentage: 0 };
                    return (
                      <div key={diff} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300">{diff}</span>
                          <span className="font-mono text-slate-400">
                            {data.solved} / {data.total} ({data.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              diff === 'Easy'
                                ? 'bg-emerald-500'
                                : diff === 'Medium'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Topic Mastery Map */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-purple-400" />
                  <span>Topic Mastery Progress</span>
                </h3>

                <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {analytics.topicMastery?.map((t) => (
                    <div
                      key={t.topic}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white truncate max-w-[120px]">{t.topic}</span>
                        <span className="font-mono text-indigo-400 font-bold">{t.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${t.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL: ADD PERSONAL DSA PROBLEM */}
        {/* ========================================== */}
        {isDSAModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  <span>Log Personal Problem</span>
                </h3>
                <button onClick={() => setIsDSAModalOpen(false)} className="text-slate-500 hover:text-white">
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
                    placeholder="e.g. Longest Substring Without Repeating Characters"
                    value={dsaForm.title}
                    onChange={(e) => setDsaForm({ ...dsaForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Platform</label>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                    <select
                      value={dsaForm.status}
                      onChange={(e) => setDsaForm({ ...dsaForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Solved">Solved</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Todo">Todo</option>
                      <option value="Revisit">Revisit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Problem URL (Optional)
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
