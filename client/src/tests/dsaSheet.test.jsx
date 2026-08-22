import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlacementPage } from '../pages/PlacementPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AuthContext } from '../context/AuthContext';
import { placementService } from '../services/placementService';
import { adminService } from '../services/adminService';

vi.mock('../services/placementService', () => ({
  placementService: {
    getMustDoSheet: vi.fn(),
    updateQuestionProgress: vi.fn(),
    getDSAAnalytics: vi.fn(),
    getDSAProblems: vi.fn(),
    getJobPipeline: vi.fn(),
    createDSAProblem: vi.fn(),
    updateDSAProblem: vi.fn(),
    deleteDSAProblem: vi.fn(),
    createJobApplication: vi.fn(),
    updateJobApplication: vi.fn(),
    deleteJobApplication: vi.fn(),
  },
}));

vi.mock('../services/adminService', () => ({
  adminService: {
    getStats: vi.fn(),
    getUsers: vi.fn(),
    getCourses: vi.fn(),
    getProjects: vi.fn(),
    getReports: vi.fn(),
    getAdminDSASheet: vi.fn(),
    updateDSASheetMetadata: vi.fn(),
    togglePublishDSASheet: vi.fn(),
    addDSASheetQuestion: vi.fn(),
    updateDSASheetQuestion: vi.fn(),
    deleteDSASheetQuestion: vi.fn(),
    reorderDSASheetQuestions: vi.fn(),
  },
}));

const mockStudent = {
  _id: 'student_123',
  name: 'Alice Algorithmic',
  email: 'alice@campusflow.edu',
  role: 'student',
};

const mockAdmin = {
  _id: 'admin_123',
  name: 'Admin Curator',
  email: 'admin@campusflow.edu',
  role: 'admin',
};

const mockPublishedSheetPayload = {
  isPublished: true,
  sheet: {
    _id: 'sheet_001',
    title: 'Must-to-Do DSA Core Sheet',
    description: 'Master the most critical algorithmic patterns and core data structures.',
    isPublished: true,
    totalQuestions: 2,
  },
  questions: [
    {
      _id: 'q_001',
      title: 'Two Sum',
      problemUrl: 'https://leetcode.com/problems/two-sum/',
      platform: 'LeetCode',
      topic: 'Arrays',
      subTopic: 'Hash Map',
      difficulty: 'Easy',
      tags: ['Array', 'Hash Table'],
      order: 1,
      userStatus: 'SOLVED',
      solvedAt: '2026-08-23T00:00:00.000Z',
    },
    {
      _id: 'q_002',
      title: '3Sum',
      problemUrl: 'https://leetcode.com/problems/3sum/',
      platform: 'LeetCode',
      topic: 'Arrays',
      subTopic: 'Two Pointers',
      difficulty: 'Medium',
      tags: ['Array', 'Two Pointers'],
      order: 2,
      userStatus: 'NOT_STARTED',
      solvedAt: null,
    },
  ],
  stats: {
    totalQuestions: 2,
    solvedCount: 1,
    attemptedCount: 0,
    completionPercentage: 50,
    topicBreakdown: [{ topic: 'Arrays', total: 2, solved: 1, percentage: 50 }],
    difficultyBreakdown: {
      Easy: { total: 1, solved: 1 },
      Medium: { total: 1, solved: 0 },
      Hard: { total: 0, solved: 0 },
    },
  },
};

const renderWithProviders = (ui, { user = mockStudent } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const authValue = {
    user,
    accessToken: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    updateUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('Frontend Must-to-Do DSA Sheet & Admin Curation (Level 16)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    placementService.getMustDoSheet.mockResolvedValue({
      data: { data: mockPublishedSheetPayload },
    });

    placementService.getDSAProblems.mockResolvedValue({
      data: { data: { problems: [], pagination: { total: 0 } } },
    });

    placementService.getDSAAnalytics.mockResolvedValue({
      data: { data: { summary: {}, difficulty: {}, topicMastery: [] } },
    });

    placementService.getJobPipeline.mockResolvedValue({
      data: { data: { stages: {}, metrics: {} } },
    });

    adminService.getStats.mockResolvedValue({
      data: {
        data: {
          users: { total: 10, students: 8, faculty: 1, admins: 1, active: 10, suspended: 0 },
          academics: { totalCourses: 2, publishedCourses: 2, totalAssignments: 5, totalSubmissions: 12 },
          projects: { totalProjects: 3, activeProjects: 2 },
        },
      },
    });

    adminService.getAdminDSASheet.mockResolvedValue({
      data: {
        data: {
          sheet: {
            _id: 'sheet_001',
            title: 'Must-to-Do DSA Core Sheet',
            description: 'Master core patterns',
            isPublished: true,
            totalQuestions: 2,
          },
          questions: mockPublishedSheetPayload.questions,
        },
      },
    });
  });

  describe('Student Must-to-Do DSA Sheet View (PlacementPage)', () => {
    it('renders the ⭐ Must-to-Do DSA Sheet tab by default with progress scorecard', async () => {
      renderWithProviders(<PlacementPage />);

      expect(screen.getByText(/⭐ Must-to-Do DSA Sheet/i)).toBeInTheDocument();
      expect(await screen.findByText('Must-to-Do DSA Core Sheet')).toBeInTheDocument();

      // Check Progress Scorecard
      expect(await screen.findByText(/1 of 2 Problems Solved/i)).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders question items with difficulty badges and external solve links', async () => {
      renderWithProviders(<PlacementPage />);

      expect(await screen.findByText('Two Sum')).toBeInTheDocument();
      expect(screen.getByText('3Sum')).toBeInTheDocument();

      // Check external link attributes
      const solveLinks = await screen.findAllByTitle(/Open original problem in new tab/i);
      expect(solveLinks.length).toBe(2);
      expect(solveLinks[0]).toHaveAttribute('href', 'https://leetcode.com/problems/two-sum/');
      expect(solveLinks[0]).toHaveAttribute('target', '_blank');
      expect(solveLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('allows changing question status and triggers updateQuestionProgress mutation', async () => {
      placementService.updateQuestionProgress.mockResolvedValue({
        data: { data: { questionId: 'q_002', userStatus: 'SOLVED' } },
      });

      renderWithProviders(<PlacementPage />);

      expect(await screen.findByText('3Sum')).toBeInTheDocument();

      const selects = screen.getAllByRole('combobox');
      // The status select for 3Sum
      const statusSelect = selects.find((s) => s.value === 'NOT_STARTED');
      expect(statusSelect).toBeDefined();

      fireEvent.change(statusSelect, { target: { value: 'SOLVED' } });

      await waitFor(() => {
        expect(placementService.updateQuestionProgress).toHaveBeenCalledWith('q_002', {
          status: 'SOLVED',
          notes: undefined,
        });
      });
    });
  });

  describe('Admin Dashboard DSA Management Tab (AdminDashboardPage)', () => {
    it('renders DSA Sheet management tab in AdminDashboardPage', async () => {
      renderWithProviders(<AdminDashboardPage />, { user: mockAdmin });

      const dsaTab = screen.getByRole('button', { name: /⭐ DSA Sheet/i });
      fireEvent.click(dsaTab);

      expect(await screen.findByText('Must-to-Do DSA Core Sheet')).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /Add Question/i })).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /Unpublish Sheet/i })).toBeInTheDocument();
    });

    it('opens Add Question modal and submits new question', async () => {
      adminService.addDSASheetQuestion.mockResolvedValue({
        data: { data: { question: { _id: 'q_new', title: 'Binary Tree Inorder' } } },
      });

      renderWithProviders(<AdminDashboardPage />, { user: mockAdmin });

      const dsaTab = screen.getByRole('button', { name: /⭐ DSA Sheet/i });
      fireEvent.click(dsaTab);

      const addBtn = await screen.findByRole('button', { name: /Add Question/i });
      fireEvent.click(addBtn);

      expect(await screen.findByText('Add Question to Must-to-Do Sheet')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText(/e\.g\. Two Sum/i), {
        target: { value: 'Binary Tree Inorder' },
      });
      fireEvent.change(screen.getByPlaceholderText(/https:\/\/leetcode\.com\/problems/i), {
        target: { value: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
      });

      const saveBtn = screen.getByRole('button', { name: /Save Question/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(adminService.addDSASheetQuestion).toHaveBeenCalled();
      });
    });
  });
});
