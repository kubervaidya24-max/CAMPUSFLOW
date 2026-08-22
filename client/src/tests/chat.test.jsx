import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectChat } from '../components/chat/ProjectChat';
import { AuthContext } from '../context/AuthContext';
import * as useProjectChatHook from '../hooks/useProjectChat';

const mockUser = {
  _id: 'user123',
  name: 'Alice Turing',
  email: 'alice@campusflow.edu',
  role: 'student',
  profile: {
    department: 'Computer Science',
  },
};

const mockMessages = [
  {
    _id: 'msg001',
    content: 'Welcome everyone to the Project Alpha team chat!',
    sender: {
      _id: 'user123',
      name: 'Alice Turing',
      role: 'student',
    },
    createdAt: new Date('2026-08-22T10:00:00Z').toISOString(),
  },
  {
    _id: 'msg002',
    content: 'Glad to be here! Setting up WebSocket gateway now.',
    sender: {
      _id: 'user456',
      name: 'Bob Lovelace',
      role: 'student',
    },
    createdAt: new Date('2026-08-22T10:02:00Z').toISOString(),
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

describe('Real-Time Project Chat Component (Level 6)', () => {
  let mockSendMessage;
  let mockStartTyping;
  let mockStopTyping;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMessage = vi.fn().mockResolvedValue(true);
    mockStartTyping = vi.fn();
    mockStopTyping = vi.fn();

    vi.spyOn(useProjectChatHook, 'useProjectChat').mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      startTyping: mockStartTyping,
      stopTyping: mockStopTyping,
      typingUsers: [],
      onlineUsers: ['user123', 'user456'],
      connectionStatus: 'connected',
      roomError: null,
      isLoading: false,
      isSending: false,
    });
  });

  it('renders chat header with project title, online users count, and connection status', () => {
    renderWithProviders(
      <ProjectChat projectId="proj101" projectTitle="CampusFlow Core" />
    );

    expect(screen.getByText(/CampusFlow Core — Live Team Chat/i)).toBeInTheDocument();
    expect(screen.getByText(/2 online/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Stream Active/i)).toBeInTheDocument();
  });

  it('renders messages stream with sender names and contents', () => {
    renderWithProviders(
      <ProjectChat projectId="proj101" projectTitle="CampusFlow Core" />
    );

    expect(
      screen.getByText('Welcome everyone to the Project Alpha team chat!')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Glad to be here! Setting up WebSocket gateway now.')
    ).toBeInTheDocument();
    expect(screen.getByText('Bob Lovelace')).toBeInTheDocument();
  });

  it('handles typing and sending new messages', () => {
    renderWithProviders(
      <ProjectChat projectId="proj101" projectTitle="CampusFlow Core" />
    );

    const input = screen.getByPlaceholderText(/Type a message to project team/i);
    fireEvent.change(input, { target: { value: 'Can everyone see this update?' } });

    expect(mockStartTyping).toHaveBeenCalled();

    const sendBtn = screen.getByTitle('Send Message');
    fireEvent.click(sendBtn);

    expect(mockSendMessage).toHaveBeenCalledWith('Can everyone see this update?');
    expect(mockStopTyping).toHaveBeenCalled();
  });

  it('displays typing indicator when another user is typing', () => {
    vi.spyOn(useProjectChatHook, 'useProjectChat').mockReturnValue({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      startTyping: mockStartTyping,
      stopTyping: mockStopTyping,
      typingUsers: [{ _id: 'user456', name: 'Bob Lovelace' }],
      onlineUsers: ['user123', 'user456'],
      connectionStatus: 'connected',
      roomError: null,
      isLoading: false,
      isSending: false,
    });

    renderWithProviders(
      <ProjectChat projectId="proj101" projectTitle="CampusFlow Core" />
    );

    expect(screen.getByText(/Bob is typing/i)).toBeInTheDocument();
  });
});
