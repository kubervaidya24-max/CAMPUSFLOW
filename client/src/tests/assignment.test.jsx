import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssignmentsPage } from '../pages/AssignmentsPage';
import { AssignmentDetailsPage } from '../pages/AssignmentDetailsPage';
import { AssignmentCard } from '../components/assignments/AssignmentCard';
import { AuthContext } from '../context/AuthContext';
import { assignmentService } from '../services/assignmentService';
import { courseService } from '../services/courseService';

vi.mock('../services/assignmentService', () => ({
  assignmentService: {
    getAssignments: vi.fn(),
    getAssignmentById: vi.fn(),
    createAssignment: vi.fn(),
    updateAssignment: vi.fn(),
    deleteAssignment: vi.fn(),
    submitAssignment: vi.fn(),
    getSubmissionsForAssignment: vi.fn(),
    gradeSubmission: vi.fn(),
  },
}));

vi.mock('../services/courseService', () => ({
  courseService: {
    getCourses: vi.fn(),
  },
}));

const mockStudentUser = {
  _id: 'student123',
  name: 'Harry Potter',
  email: 'harry@campusflow.edu',
  role: 'student',
  profile: {
    department: 'Computer Science',
    semester: 5,
  },
};

const mockAssignment = {
  _id: 'assign401',
  title: 'Lab 1: User-Space Thread Scheduler',
  description: 'Implement cooperative thread context switching in C.',
  course: {
    _id: 'course302',
    title: 'Advanced Operating Systems',
    code: 'CS302',
  },
  faculty: {
    _id: 'faculty999',
    name: 'Prof. Minerva McGonagall',
    email: 'minerva@campusflow.edu',
  },
  dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  totalPoints: 100,
  allowLate: true,
  attachments: [{ name: 'starter_code.zip', url: 'https://campusflow.edu/starter.zip', size: 1024 }],
  status: 'published',
  submissionStatus: 'pending',
  mySubmission: null,
};

const renderWithProviders = (ui, { user = mockStudentUser, route = '/' } = {}) => {
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
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('Assignment & Submission Subsystem (Level 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    courseService.getCourses.mockResolvedValue({
      success: true,
      data: { courses: [mockAssignment.course] },
    });
    assignmentService.getAssignments.mockResolvedValue({
      success: true,
      data: { assignments: [mockAssignment] },
    });
    assignmentService.getAssignmentById.mockResolvedValue({
      success: true,
      data: {
        assignment: mockAssignment,
        mySubmission: null,
      },
    });
  });

  it('renders AssignmentsPage with search bar, course dropdown, and lists assignments', async () => {
    renderWithProviders(<AssignmentsPage />, { user: mockStudentUser, route: '/assignments' });

    expect(await screen.findByText('Lab 1: User-Space Thread Scheduler')).toBeInTheDocument();
    expect(screen.getByText('CS302')).toBeInTheDocument();
    expect(screen.getByText('100 Points')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by assignment title/i)).toBeInTheDocument();
  });

  it('renders AssignmentCard with points, course code, and pending status pill', () => {
    renderWithProviders(<AssignmentCard assignment={mockAssignment} />, { user: mockStudentUser });

    expect(screen.getByText('Lab 1: User-Space Thread Scheduler')).toBeInTheDocument();
    expect(screen.getByText('100 Points')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Submit Assignment')).toBeInTheDocument();
  });

  it('renders AssignmentDetailsPage with instructions and student submission form', async () => {
    assignmentService.submitAssignment.mockResolvedValue({
      success: true,
      data: { submission: { status: 'submitted' } },
    });

    renderWithProviders(
      <Routes>
        <Route path="/assignments/:id" element={<AssignmentDetailsPage />} />
      </Routes>,
      { user: mockStudentUser, route: '/assignments/assign401' }
    );

    expect(await screen.findByText('Lab 1: User-Space Thread Scheduler')).toBeInTheDocument();
    expect(screen.getByText(/Implement cooperative thread context switching/i)).toBeInTheDocument();
    expect(screen.getByText('starter_code.zip')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/https:\/\/github.com\/username\/project/i);
    fireEvent.change(textarea, { target: { value: 'https://github.com/harry/scheduler-lab' } });

    const submitBtn = screen.getByRole('button', { name: /^Submit Assignment$/i });
    const form = submitBtn.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(assignmentService.submitAssignment).toHaveBeenCalledWith('assign401', {
        content: 'https://github.com/harry/scheduler-lab',
        attachments: [],
      });
    });
  });
});
