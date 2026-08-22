import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CoursesPage } from '../pages/CoursesPage';
import { CourseDetailsPage } from '../pages/CourseDetailsPage';
import { CourseCard } from '../components/courses/CourseCard';
import { AuthContext } from '../context/AuthContext';
import { courseService } from '../services/courseService';

vi.mock('../services/courseService', () => ({
  courseService: {
    getCourses: vi.fn(),
    getCourseById: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
    enrollCourse: vi.fn(),
    unenrollCourse: vi.fn(),
  },
}));

const mockStudentUser = {
  _id: 'student123',
  name: 'Harry Potter',
  email: 'harry@campusflow.edu',
  role: 'student',
  profile: {
    department: 'Computer Science',
    semester: 3,
  },
};

const mockCourse = {
  _id: 'course401',
  title: 'Distributed Systems & Cloud Architecture',
  code: 'CS401',
  description: 'Learn consensus algorithms and cloud scalability.',
  department: 'Computer Science',
  semester: 7,
  credits: 4,
  capacity: 60,
  status: 'published',
  enrolledCount: 15,
  enrolledStudents: [],
  faculty: {
    _id: 'faculty999',
    name: 'Prof. Dumbledore',
    email: 'dumbledore@campusflow.edu',
    profile: {
      avatar: '',
      department: 'Computer Science',
      designation: 'Head of Department',
    },
  },
  syllabus: [
    { week: 1, title: 'Introduction to Distributed Systems', description: 'RPC and CAP theorem' },
    { week: 2, title: 'Consensus Protocols', description: 'Raft algorithm' },
  ],
  schedule: {
    days: ['Mon', 'Wed'],
    time: '10:00 AM - 11:30 AM',
    room: 'Hall B-201',
  },
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

describe('Course Management Subsystem (Level 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    courseService.getCourses.mockResolvedValue({
      success: true,
      data: {
        courses: [mockCourse],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      },
    });
    courseService.getCourseById.mockResolvedValue({
      success: true,
      data: {
        course: mockCourse,
        isEnrolled: false,
        isOwner: false,
      },
    });
  });

  it('renders CoursesPage with search bar, department filters, and lists courses', async () => {
    renderWithProviders(<CoursesPage />, { user: mockStudentUser, route: '/courses' });

    expect(await screen.findByText('Distributed Systems & Cloud Architecture')).toBeInTheDocument();
    expect(screen.getByText('CS401')).toBeInTheDocument();
    expect(screen.getByText('4 Credits')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by course title/i)).toBeInTheDocument();
    expect(screen.getByText('All Departments')).toBeInTheDocument();
  });

  it('renders CourseCard with faculty instructor and handles enrollment click', async () => {
    const onEnrollMock = vi.fn();

    renderWithProviders(
      <CourseCard course={mockCourse} onEnroll={onEnrollMock} isEnrolling={false} />,
      { user: mockStudentUser }
    );

    expect(screen.getByText('Distributed Systems & Cloud Architecture')).toBeInTheDocument();
    expect(screen.getByText('Prof. Dumbledore')).toBeInTheDocument();

    const enrollButton = screen.getByRole('button', { name: /^Enroll$/i });
    fireEvent.click(enrollButton);

    expect(onEnrollMock).toHaveBeenCalledWith('course401');
  });

  it('renders CourseDetailsPage with weekly syllabus modules and lecture schedule', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
      </Routes>,
      { user: mockStudentUser, route: '/courses/course401' }
    );

    expect(await screen.findByText('Distributed Systems & Cloud Architecture')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Distributed Systems')).toBeInTheDocument();
    expect(screen.getByText('Consensus Protocols')).toBeInTheDocument();
    expect(screen.getByText('Hall B-201')).toBeInTheDocument();
    expect(screen.getByText('Enroll Now')).toBeInTheDocument();
  });
});
