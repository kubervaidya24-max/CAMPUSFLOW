import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { NotificationPanel } from '../components/notifications/NotificationPanel';
import { AuthContext } from '../context/AuthContext';
import * as useNotificationsHook from '../hooks/useNotifications';

const mockUser = {
  _id: 'user123',
  name: 'Alice Turing',
  email: 'alice@campusflow.edu',
  role: 'student',
};

const mockNotifications = [
  {
    _id: 'notif001',
    type: 'project_invitation',
    title: 'Project Invitation',
    message: 'Bob invited you to join "CampusFlow Realtime Engine"',
    read: false,
    relatedResource: {
      kind: 'project',
      url: '/projects',
    },
    createdAt: new Date('2026-08-22T10:00:00Z').toISOString(),
  },
  {
    _id: 'notif002',
    type: 'assignment_created',
    title: 'New Assignment Posted',
    message: 'New assignment "Distributed Consensus" posted for CS401.',
    read: true,
    relatedResource: {
      kind: 'assignment',
      url: '/assignments/asg123',
    },
    createdAt: new Date('2026-08-22T08:00:00Z').toISOString(),
  },
];

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

describe('Centralized Notification Subsystem (Level 7)', () => {
  let mockMarkAsRead;
  let mockMarkAllAsRead;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkAsRead = vi.fn();
    mockMarkAllAsRead = vi.fn();

    vi.spyOn(useNotificationsHook, 'useNotifications').mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      isError: false,
      error: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      isMarkingAllAsRead: false,
    });
  });

  it('renders NotificationBell with unread counter badge and toggles panel on click', () => {
    renderWithProviders(<NotificationBell />);

    // Check bell button and unread count badge
    expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Click bell to open panel
    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('1 new')).toBeInTheDocument();
    expect(screen.getByText('Project Invitation')).toBeInTheDocument();
  });

  it('renders NotificationPanel with notifications list and triggers markAsRead and markAllAsRead', () => {
    renderWithProviders(
      <NotificationPanel
        notifications={mockNotifications}
        unreadCount={1}
        isLoading={false}
        onMarkAsRead={mockMarkAsRead}
        onMarkAllAsRead={mockMarkAllAsRead}
        isMarkingAll={false}
      />
    );

    expect(screen.getByText('Project Invitation')).toBeInTheDocument();
    expect(
      screen.getByText('Bob invited you to join "CampusFlow Realtime Engine"')
    ).toBeInTheDocument();
    expect(screen.getByText('New Assignment Posted')).toBeInTheDocument();

    // Click "Mark all read"
    const markAllBtn = screen.getByRole('button', { name: /Mark all read/i });
    fireEvent.click(markAllBtn);
    expect(mockMarkAllAsRead).toHaveBeenCalled();

    // Click on unread notification
    const unreadCard = screen.getByText('Project Invitation').closest('div');
    fireEvent.click(unreadCard);
    expect(mockMarkAsRead).toHaveBeenCalledWith('notif001');
  });

  it('renders empty state when there are no notifications', () => {
    renderWithProviders(
      <NotificationPanel
        notifications={[]}
        unreadCount={0}
        isLoading={false}
        onMarkAsRead={mockMarkAsRead}
        onMarkAllAsRead={mockMarkAllAsRead}
      />
    );

    expect(screen.getByText('All Caught Up!')).toBeInTheDocument();
  });
});
