import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectCard } from '../components/projects/ProjectCard';
import { KanbanBoard } from '../components/projects/KanbanBoard';
import { AuthContext } from '../context/AuthContext';
import { projectService } from '../services/projectService';

vi.mock('../services/projectService', () => ({
  projectService: {
    getProjects: vi.fn(),
    getProjectById: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    inviteMember: vi.fn(),
    respondInvitation: vi.fn(),
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
    getActivities: vi.fn(),
  },
}));

const mockStudentUser = {
  _id: 'student123',
  name: 'Alice Turing',
  email: 'alice@campusflow.edu',
  role: 'student',
  profile: {
    department: 'Computer Science',
    semester: 5,
  },
};

const mockProject = {
  _id: 'proj101',
  title: 'CampusFlow Realtime Engine',
  description: 'Collaborative real-time sync with Socket.io and React.',
  owner: {
    _id: 'student123',
    name: 'Alice Turing',
    email: 'alice@campusflow.edu',
  },
  members: [
    {
      user: {
        _id: 'student123',
        name: 'Alice Turing',
        email: 'alice@campusflow.edu',
      },
      role: 'owner',
    },
    {
      user: {
        _id: 'student456',
        name: 'Bob Lovelace',
        email: 'bob@campusflow.edu',
      },
      role: 'member',
    },
  ],
  technologies: ['React', 'Node.js', 'Socket.IO', 'Docker'],
  status: 'active',
};

const mockTasks = [
  {
    _id: 'task001',
    title: 'Setup Socket.IO Gateway',
    description: 'Build connection handshake with JWT auth.',
    priority: 'high',
    status: 'TODO',
    assignee: mockStudentUser,
  },
  {
    _id: 'task002',
    title: 'Build Kanban Drag & Drop',
    description: 'Implement column reordering.',
    priority: 'medium',
    status: 'IN_PROGRESS',
    assignee: null,
  },
  {
    _id: 'task003',
    title: 'Design DB Schemas',
    description: 'Task, Project, Activity models.',
    priority: 'urgent',
    status: 'DONE',
    assignee: mockStudentUser,
  },
];

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

describe('Project Collaboration & Kanban Subsystem (Level 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectService.getProjects.mockResolvedValue({
      success: true,
      data: { projects: [mockProject] },
    });
    projectService.getProjectById.mockResolvedValue({
      success: true,
      data: { project: mockProject, isMember: true, isOwner: true },
    });
    projectService.getTasks.mockResolvedValue({
      success: true,
      data: { tasks: mockTasks },
    });
  });

  it('renders ProjectsPage with project list, search input, and invitation tabs', async () => {
    renderWithProviders(<ProjectsPage />, { user: mockStudentUser, route: '/projects' });

    expect(await screen.findByText('CampusFlow Realtime Engine')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search projects or tech stacks/i)).toBeInTheDocument();
    expect(screen.getByText('Invitations')).toBeInTheDocument();
  });

  it('renders ProjectCard with status badge, member count, and Open Workspace button', () => {
    renderWithProviders(<ProjectCard project={mockProject} />, { user: mockStudentUser });

    expect(screen.getByText('CampusFlow Realtime Engine')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('2 members')).toBeInTheDocument();
    expect(screen.getByText('Open Workspace')).toBeInTheDocument();
  });

  it('renders KanbanBoard with 3 columns and triggers task status move', async () => {
    projectService.updateTaskStatus.mockResolvedValue({
      success: true,
      data: { task: { ...mockTasks[0], status: 'IN_PROGRESS' } },
    });

    renderWithProviders(
      <KanbanBoard
        projectId="proj101"
        tasks={mockTasks}
        members={mockProject.members}
      />,
      { user: mockStudentUser }
    );

    expect(screen.getByText('Setup Socket.IO Gateway')).toBeInTheDocument();
    expect(screen.getByText('Build Kanban Drag & Drop')).toBeInTheDocument();
    expect(screen.getByText('Design DB Schemas')).toBeInTheDocument();

    // Click "Start Progress" on the TODO task
    const startProgressBtn = screen.getByRole('button', { name: /^Start Progress$/i });
    fireEvent.click(startProgressBtn);

    await waitFor(() => {
      expect(projectService.updateTaskStatus).toHaveBeenCalledWith('task001', 'IN_PROGRESS');
    });
  });
});
