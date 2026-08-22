import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfilePage } from '../pages/ProfilePage';
import { EditProfilePage } from '../pages/EditProfilePage';
import { AuthContext } from '../context/AuthContext';
import { userService } from '../services/userService';

vi.mock('../services/userService', () => ({
  userService: {
    getMyProfile: vi.fn(),
    updateMyProfile: vi.fn(),
    getUserById: vi.fn(),
  },
}));

const mockStudentUser = {
  _id: 'user123',
  name: 'Bonnie Bennett',
  email: 'bonnie@campusflow.edu',
  role: 'student',
  profile: {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'CS student passionate about full stack development and distributed systems.',
    department: 'Computer Science',
    semester: 6,
    graduationYear: 2026,
    collegeId: '2026-CS-099',
    skills: ['React', 'Node.js', 'MongoDB'],
    interests: ['Web Development', 'AI'],
    socialLinks: {
      github: 'https://github.com/bonnie',
      linkedin: 'https://linkedin.com/in/bonnie',
      portfolio: 'https://bonnie.dev',
    },
  },
};

const mockFacultyUser = {
  _id: 'faculty456',
  name: 'Dr. Stefan Salvatore',
  email: 'stefan.faculty@campusflow.edu',
  role: 'faculty',
  profile: {
    bio: 'Professor of Computer Architecture.',
    department: 'Computer Science',
    designation: 'Associate Professor',
    subjects: ['Computer Networks', 'Operating Systems'],
    officeLocation: 'Academic Block B, Room 204',
  },
};

const renderWithAuth = (ui, { user = mockStudentUser, route = '/' } = {}) => {
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

describe('Client Profile Views & Editing (Level 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userService.getMyProfile.mockResolvedValue({
      success: true,
      data: { user: mockStudentUser },
    });
    userService.getUserById.mockResolvedValue({
      success: true,
      data: { user: mockFacultyUser },
    });
  });

  it('renders student ProfilePage with academic details, skills, and social links', async () => {
    renderWithAuth(<ProfilePage />, { user: mockStudentUser, route: '/profile' });

    expect(await screen.findByText('Bonnie Bennett')).toBeInTheDocument();
    expect(screen.getByText('student')).toBeInTheDocument();
    expect(screen.getAllByText(/Semester 6/i)[0]).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('GitHub Profile')).toBeInTheDocument();
  });

  it('renders faculty ProfilePage when viewing another user by ID', async () => {
    renderWithAuth(
      <Routes>
        <Route path="/profile/:id" element={<ProfilePage />} />
      </Routes>,
      { user: mockStudentUser, route: '/profile/faculty456' }
    );

    expect(await screen.findByText('Dr. Stefan Salvatore')).toBeInTheDocument();
    expect(screen.getAllByText('Associate Professor')[0]).toBeInTheDocument();
    expect(screen.getByText('Computer Networks')).toBeInTheDocument();
    expect(screen.getByText('Operating Systems')).toBeInTheDocument();
  });

  it('renders EditProfilePage with form inputs and supports adding skills', async () => {
    renderWithAuth(<EditProfilePage />, { user: mockStudentUser, route: '/profile/edit' });

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bonnie Bennett')).toBeInTheDocument();

    const skillInput = screen.getByPlaceholderText(/e\.g\. React, Node\.js/i);
    fireEvent.change(skillInput, { target: { value: 'Docker' } });

    const addSkillBtn = screen.getByRole('button', { name: /Add Skill/i });
    fireEvent.click(addSkillBtn);

    expect(screen.getByText('Docker')).toBeInTheDocument();
  });
});
