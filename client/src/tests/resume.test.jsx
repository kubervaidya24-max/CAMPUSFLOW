import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResumeBuilderPage } from '../pages/ResumeBuilderPage';
import { AuthContext } from '../context/AuthContext';
import { resumeService } from '../services/resumeService';

vi.mock('../services/resumeService', () => ({
  resumeService: {
    getResumes: vi.fn(),
    getResumeById: vi.fn(),
    createResume: vi.fn(),
    updateResume: vi.fn(),
    deleteResume: vi.fn(),
    getAutoFillDraft: vi.fn(),
  },
}));

const mockUser = {
  _id: 'user123',
  name: 'Alice Turing',
  email: 'alice@campusflow.edu',
  role: 'student',
  profile: {
    department: 'Computer Science',
    skills: ['React', 'Node.js', 'MongoDB', 'Go'],
    bio: 'Distributed systems engineer and researcher.',
  },
};

const mockResume = {
  _id: 'resume001',
  title: 'Full Stack Engineer Resume',
  template: 'modern',
  personalInfo: {
    fullName: 'Alice Turing',
    email: 'alice@campusflow.edu',
    phone: '+1 555-0199',
    headline: 'Senior Full Stack Engineer',
    summary: 'Building high performance distributed systems.',
  },
  education: [
    {
      institution: 'State University',
      degree: 'B.Tech in Computer Science',
      startDate: '2023',
      endDate: '2027',
      grade: '3.9 GPA',
    },
  ],
  skills: [
    {
      category: 'Languages & Frameworks',
      items: ['React', 'Node.js', 'Go', 'TypeScript'],
    },
  ],
  projects: [
    {
      title: 'CampusFlow Architecture',
      role: 'Lead Architect',
      technologies: ['React', 'Node.js', 'Socket.IO'],
      highlights: ['Engineered scalable microservices.'],
    },
  ],
  experience: [],
  certifications: [],
  achievements: [],
  links: {
    github: 'https://github.com/alicing',
    linkedin: 'https://linkedin.com/in/alicing',
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

describe('Dynamic Resume Builder Module (Level 9)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    resumeService.getResumes.mockResolvedValue({
      data: { resumes: [mockResume] },
    });

    resumeService.getAutoFillDraft.mockResolvedValue({
      data: {
        draft: {
          ...mockResume,
          title: "Alice's Tech Resume",
          personalInfo: {
            ...mockResume.personalInfo,
            summary: 'Auto-imported from Alice profile bio.',
          },
        },
      },
    });
  });

  it('renders ResumeBuilderPage with top header, template selector, and section accordions', async () => {
    renderWithProviders(<ResumeBuilderPage />);

    expect(screen.getByText('Dynamic Resume Builder')).toBeInTheDocument();
    expect(screen.getByText('ATS Ready')).toBeInTheDocument();
    expect(screen.getByText('Modern ATS (Single Column)')).toBeInTheDocument();
    expect(screen.getByText('Executive Split (Dual Column)')).toBeInTheDocument();
    expect(screen.getByText('Auto-Fill from Profile')).toBeInTheDocument();
    expect(screen.getByText('Save Resume')).toBeInTheDocument();
    expect(screen.getByText('Export PDF / Print')).toBeInTheDocument();

    // Verify section accordions
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Key Projects')).toBeInTheDocument();
    expect(screen.getByText('Work & Internships')).toBeInTheDocument();
    expect(screen.getByText('Education & Academics')).toBeInTheDocument();

    // Verify live preview renders loaded resume
    expect(await screen.findByText('Full Stack Engineer Resume')).toBeInTheDocument();
  });

  it('switches resume template layout to Executive Split (Dual Column)', async () => {
    renderWithProviders(<ResumeBuilderPage />);

    const dualColBtn = screen.getByRole('button', { name: /Executive Split/i });
    fireEvent.click(dualColBtn);

    // Live preview switches and renders sidebar sections
    expect(screen.getByText('Executive Split (Dual Column)')).toBeInTheDocument();
  });

  it('imports profile & project data when Auto-Fill button is clicked', async () => {
    renderWithProviders(<ResumeBuilderPage />);

    const autoFillBtn = screen.getByRole('button', { name: /Auto-Fill from Profile/i });
    fireEvent.click(autoFillBtn);

    await waitFor(() => {
      expect(resumeService.getAutoFillDraft).toHaveBeenCalled();
    });

    expect(
      await screen.findByText('Profile & project data imported into editor!')
    ).toBeInTheDocument();
  });
});
