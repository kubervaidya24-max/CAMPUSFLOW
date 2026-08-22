import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AuthContext } from '../context/AuthContext';
import { adminService } from '../services/adminService';

vi.mock('../services/adminService', () => ({
  adminService: {
    getStats: vi.fn(),
    getUsers: vi.fn(),
    updateUser: vi.fn(),
    getCourses: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
    getProjects: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
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

const mockAdminUser = {
  _id: 'admin_123',
  name: 'Root Admin',
  email: 'admin@campusflow.edu',
  role: 'admin',
};

const mockStats = {
  users: { total: 42, students: 30, faculty: 10, admins: 2, active: 40, suspended: 2 },
  academics: { totalCourses: 15, publishedCourses: 12, totalAssignments: 40, totalSubmissions: 120 },
  projects: { totalProjects: 8, activeProjects: 6 },
};

const mockUsers = [
  {
    _id: 'user_1',
    name: 'Ada Lovelace',
    email: 'ada@campusflow.edu',
    role: 'student',
    isActive: true,
    department: 'Computer Science',
  },
  {
    _id: 'user_2',
    name: 'Bad Actor',
    email: 'bad@campusflow.edu',
    role: 'student',
    isActive: false,
    department: 'Electrical Engineering',
  },
];

const mockCourses = [
  {
    _id: 'course_1',
    title: 'Operating Systems Internals',
    code: 'CS401',
    department: 'Computer Science',
    status: 'published',
    instructor: { name: 'Prof. Turing' },
    enrolledStudents: [{ student: 'user_1' }],
    capacity: 60,
  },
];

const mockProjects = [
  {
    _id: 'proj_1',
    title: 'Microkernel Kernel',
    description: 'Educational microkernel',
    status: 'active',
    owner: { name: 'Ada Lovelace' },
    members: [{ user: 'user_1' }],
  },
];

const mockReports = {
  recentActivities: [
    {
      _id: 'act_1',
      action: 'TASK_CREATED',
      details: 'Created scheduler task',
      user: { name: 'Ada Lovelace' },
      createdAt: new Date().toISOString(),
    },
  ],
  recentUsers: [
    {
      _id: 'user_1',
      name: 'Ada Lovelace',
      email: 'ada@campusflow.edu',
      role: 'student',
      createdAt: new Date().toISOString(),
    },
  ],
};

const mockAdminDSASheet = {
  sheet: {
    _id: 'sheet_001',
    title: 'Must-to-Do DSA Core Sheet',
    description: 'Master core patterns',
    isPublished: true,
    totalQuestions: 5,
  },
  questions: [],
};

const renderWithProviders = (ui, { user = mockAdminUser } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const authValue = {
    user,
    accessToken: 'mock-admin-token',
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

describe('Admin Panel & Governance Subsystem (Level 11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    adminService.getStats.mockResolvedValue({ data: { data: mockStats } });
    adminService.getUsers.mockResolvedValue({
      data: { data: { users: mockUsers, pagination: { total: 2, page: 1, totalPages: 1 } } },
    });
    adminService.getCourses.mockResolvedValue({
      data: { data: { courses: mockCourses, pagination: { total: 1, page: 1, totalPages: 1 } } },
    });
    adminService.getProjects.mockResolvedValue({
      data: { data: { projects: mockProjects, pagination: { total: 1, page: 1, totalPages: 1 } } },
    });
    adminService.getReports.mockResolvedValue({
      data: { data: mockReports },
    });
    adminService.getAdminDSASheet.mockResolvedValue({
      data: { data: mockAdminDSASheet },
    });
    adminService.updateUser.mockResolvedValue({ data: { success: true } });
    adminService.updateCourse.mockResolvedValue({ data: { success: true } });
  });

  it('renders AdminDashboardPage with overview KPI scorecards and user directory table', async () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(screen.getByText('Administrative Command Center')).toBeInTheDocument();
    expect(screen.getByText('Root Admin')).toBeInTheDocument();

    // Verify KPI scorecards
    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // Verify user table rows
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Bad Actor')).toBeInTheDocument();
  });

  it('switches to Course Moderation tab and displays courses list', async () => {
    renderWithProviders(<AdminDashboardPage />);

    const coursesTab = screen.getByRole('button', { name: /^Courses$/i });
    fireEvent.click(coursesTab);

    expect(await screen.findByText('Operating Systems Internals')).toBeInTheDocument();
    expect(screen.getByText('CS401')).toBeInTheDocument();
  });

  it('switches to Project Moderation tab and displays projects list', async () => {
    renderWithProviders(<AdminDashboardPage />);

    const projectsTab = screen.getByRole('button', { name: /^Projects$/i });
    fireEvent.click(projectsTab);

    expect(await screen.findByText('Microkernel Kernel')).toBeInTheDocument();
    expect(screen.getByText('Educational microkernel')).toBeInTheDocument();
  });

  it('switches to System Reports tab and displays recent activity stream', async () => {
    renderWithProviders(<AdminDashboardPage />);

    const reportsTab = screen.getByRole('button', { name: /Audit Reports/i });
    fireEvent.click(reportsTab);

    expect(await screen.findByText('Recent Platform Activity Stream')).toBeInTheDocument();
    expect(await screen.findByText('Created scheduler task')).toBeInTheDocument();
  });
});
