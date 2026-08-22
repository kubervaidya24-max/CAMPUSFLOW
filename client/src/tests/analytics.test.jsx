import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyticsDashboardPage } from '../pages/AnalyticsDashboardPage';
import { AuthContext } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';

vi.mock('../services/analyticsService', () => ({
  analyticsService: {
    getStudentAnalytics: vi.fn(),
    getProjectAnalytics: vi.fn(),
    getPlacementAnalytics: vi.fn(),
  },
}));

const mockUser = {
  _id: 'user123',
  name: 'Alice Turing',
  email: 'alice@campusflow.edu',
  role: 'student',
};

const mockStudentAnalytics = {
  academic: {
    enrolledCourses: 3,
    totalCredits: 12,
    departmentDistribution: [{ _id: 'Computer Science', count: 3, credits: 12 }],
  },
  assignments: {
    totalAssignments: 5,
    submittedCount: 4,
    gradedCount: 3,
    onTimeCount: 3,
    lateCount: 1,
    completionRate: 80,
    averageGradePercentage: 92,
    statusBreakdown: [{ _id: 'graded', count: 3 }, { _id: 'submitted', count: 1 }],
  },
  projects: {
    totalProjects: 2,
    ownedProjects: 1,
    collaboratingProjects: 1,
    tasks: {
      totalAssigned: 8,
      completed: 6,
      inProgress: 1,
      todo: 1,
      completionRate: 75,
      byPriority: [{ _id: 'high', count: 4 }, { _id: 'medium', count: 4 }],
    },
  },
  career: {
    dsa: {
      totalTracked: 15,
      solvedCount: 12,
      easySolved: 5,
      mediumSolved: 5,
      hardSolved: 2,
      completionPercentage: 80,
      byTopic: [
        { _id: 'Arrays', total: 6, solved: 5 },
        { _id: 'Dynamic Programming', total: 5, solved: 4 },
      ],
    },
    jobs: {
      totalApplications: 4,
      activePipeline: 2,
      interviewCount: 1,
      offersReceived: 1,
      rejections: 1,
      rejectionRate: 25,
      offerConversionRate: 25,
      byStatus: [{ _id: 'OFFER', count: 1 }, { _id: 'TECHNICAL', count: 1 }],
    },
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

describe('Data-Driven Analytics Dashboard Module (Level 10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    analyticsService.getStudentAnalytics.mockResolvedValue({
      data: mockStudentAnalytics,
    });
  });

  it('renders AnalyticsDashboardPage with KPI scorecards and overview progress metrics', async () => {
    renderWithProviders(<AnalyticsDashboardPage />);

    expect(screen.getByText('Data-Driven Analytics Engine')).toBeInTheDocument();
    expect(screen.getByText('Live Aggregations')).toBeInTheDocument();

    // Verify Tab buttons
    expect(screen.getByRole('button', { name: /^Overview$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Academics$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Projects$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Career & DSA$/i })).toBeInTheDocument();

    // Verify live aggregated scorecards
    expect(await screen.findByText('12')).toBeInTheDocument(); // total credits
    expect(screen.getByText('92%')).toBeInTheDocument(); // avg assignment score
    expect(screen.getAllByText('75%')[0]).toBeInTheDocument(); // task velocity
  });

  it('switches to Academics tab and renders course credits and assignment metrics', async () => {
    renderWithProviders(<AnalyticsDashboardPage />);

    const academicsTab = screen.getByRole('button', { name: /^Academics$/i });
    fireEvent.click(academicsTab);

    expect(await screen.findByText('Assignment Submission Status')).toBeInTheDocument();
    expect(screen.getByText('Enrolled Courses')).toBeInTheDocument();
    expect(screen.getByText('Total Active Credits')).toBeInTheDocument();
  });

  it('switches to Projects tab and renders project breakdown and task execution metrics', async () => {
    renderWithProviders(<AnalyticsDashboardPage />);

    const projectsTab = screen.getByRole('button', { name: /^Projects$/i });
    fireEvent.click(projectsTab);

    expect(await screen.findByText('Task Execution Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Lead / Owned')).toBeInTheDocument();
    expect(screen.getByText('Collaborating')).toBeInTheDocument();
  });

  it('switches to Career & DSA tab and renders job applications and DSA topic progress', async () => {
    renderWithProviders(<AnalyticsDashboardPage />);

    const careerTab = screen.getByRole('button', { name: /^Career & DSA$/i });
    fireEvent.click(careerTab);

    expect(await screen.findByText('DSA Topic Mastery Distribution')).toBeInTheDocument();
    expect(screen.getByText('Job Offers 🎉')).toBeInTheDocument();
    expect(screen.getByText('Rejection Rate')).toBeInTheDocument();
    expect(screen.getByText('Arrays')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Programming')).toBeInTheDocument();
  });
});
