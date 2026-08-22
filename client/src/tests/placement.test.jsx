import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlacementPage } from '../pages/PlacementPage';
import { AuthContext } from '../context/AuthContext';
import { placementService } from '../services/placementService';

vi.mock('../services/placementService', () => ({
  placementService: {
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

const mockUser = {
  _id: 'user123',
  name: 'Alice Turing',
  email: 'alice@campusflow.edu',
  role: 'student',
};

const mockDSAAnalytics = {
  summary: {
    totalProblems: 10,
    solvedCount: 7,
    completionPercentage: 70,
    currentStreak: 4,
    longestStreak: 5,
  },
  byDifficulty: {
    Easy: { total: 4, solved: 4, percentage: 100 },
    Medium: { total: 4, solved: 2, percentage: 50 },
    Hard: { total: 2, solved: 1, percentage: 50 },
  },
  byTopic: [
    { topic: 'Arrays', total: 4, solved: 3, percentage: 75 },
    { topic: 'Dynamic Programming', total: 3, solved: 2, percentage: 67 },
  ],
  byPlatform: [{ _id: 'LeetCode', count: 8, solved: 6 }],
  recentSolved: [],
};

const mockDSAProblems = [
  {
    _id: 'dsa001',
    title: 'Two Sum',
    topic: 'Arrays',
    difficulty: 'Easy',
    platform: 'LeetCode',
    status: 'Solved',
    notes: 'Used hash map for O(n).',
  },
  {
    _id: 'dsa002',
    title: 'Coin Change',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    platform: 'LeetCode',
    status: 'Todo',
    notes: '',
  },
];

const mockJobPipeline = {
  pipeline: {
    APPLIED: [{ _id: 'job001', company: 'Google', role: 'SWE', status: 'APPLIED' }],
    OA: [{ _id: 'job002', company: 'Amazon', role: 'SDE-1', status: 'OA' }],
    TECHNICAL: [],
    HR: [],
    OFFER: [{ _id: 'job003', company: 'Stripe', role: 'Backend Engineer', status: 'OFFER' }],
    REJECTED: [],
  },
  summary: {
    total: 3,
    active: 2,
    offers: 1,
    rejected: 0,
    interviews: 0,
  },
};

const renderWithProviders = (ui, { user = mockUser } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const authValue = {
    user,
    accessToken: 'mock-access-token',
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

describe('Placement Preparation & Job Pipeline Module (Level 8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    placementService.getDSAAnalytics.mockResolvedValue({
      data: mockDSAAnalytics,
    });

    placementService.getDSAProblems.mockResolvedValue({
      data: { problems: mockDSAProblems, pagination: { total: 2 } },
    });

    placementService.getJobPipeline.mockResolvedValue({
      data: mockJobPipeline,
    });
  });

  it('renders PlacementPage with DSA Practice hub, streak counter, and problem list', async () => {
    renderWithProviders(<PlacementPage />);

    expect(screen.getByText('Placement & Career Engine')).toBeInTheDocument();
    expect(screen.getByText('DSA Practice')).toBeInTheDocument();
    expect(screen.getByText('Application Pipeline')).toBeInTheDocument();

    // Check streak metric
    expect(screen.getByText('Daily Streak')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('daily-streak-count')).toHaveTextContent('4');
    });

    // Check problem list items
    expect(await screen.findByText('Two Sum')).toBeInTheDocument();
    expect(screen.getByText('Coin Change')).toBeInTheDocument();
    expect(screen.getByText('Record Problem')).toBeInTheDocument();
  });

  it('switches to Application Pipeline tab and renders stage columns and job cards', async () => {
    renderWithProviders(<PlacementPage />);

    // Click Application Pipeline tab
    const pipelineTab = screen.getByRole('button', { name: /Application Pipeline/i });
    fireEvent.click(pipelineTab);

    expect(await screen.findByText('Visual Application Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Track Application')).toBeInTheDocument();

    // Verify stage columns
    expect(await screen.findByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Online Assessment')).toBeInTheDocument();
    expect(screen.getByText('Technical Interview')).toBeInTheDocument();
    expect(screen.getByText('Job Offer 🎉')).toBeInTheDocument();

    // Verify company cards
    expect(await screen.findByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('Stripe')).toBeInTheDocument();
  });

  it('opens Record Problem modal on button click and allows form dismissal', async () => {
    renderWithProviders(<PlacementPage />);

    const recordBtn = screen.getByRole('button', { name: /Record Problem/i });
    fireEvent.click(recordBtn);

    expect(screen.getByText('Record DSA Problem')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Trapping Rain Water/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText('Record DSA Problem')).not.toBeInTheDocument();
  });
});
