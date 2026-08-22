import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { LandingPage } from '../pages/LandingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AuthProvider } from '../context/AuthContext';
import { healthService } from '../services/healthService';

// Mock healthService & authService
vi.mock('../services/healthService', () => ({
  healthService: {
    checkHealth: vi.fn(),
  },
}));

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn().mockRejectedValue(new Error('No active session')),
    getCurrentUser: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
  },
}));

// Helper to render with required providers
const renderWithProviders = (ui) => {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <AuthProvider>{ui}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Client UI Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    healthService.checkHealth.mockResolvedValue({
      success: true,
      message: 'CampusFlow API is running',
      data: {
        service: 'CampusFlow API',
        status: 'operational',
        version: '0.1.0',
        environment: 'test',
        uptimeSeconds: 42,
        timestamp: '2026-08-22T10:00:00.000Z',
        database: { status: 'connected', name: 'campusflow_test' },
      },
    });
  });

  it('renders Navbar with CampusFlow brand name', () => {
    renderWithProviders(<Navbar isBackendOnline={true} backendLatency={12} />);
    expect(screen.getByText('CampusFlow')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders Footer with copyright and architecture stack', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/CampusFlow MERN Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/Vite \+ React 18/i)).toBeInTheDocument();
  });

  it('renders LandingPage title and future modules', async () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText(/Unified College Platform for/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic & Courses/i)).toBeInTheDocument();
    expect(screen.getByText(/Assignments & Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Full-Stack Integration Verification/i)).toBeInTheDocument();
    expect(await screen.findByText(/Operational \(200\)/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage with return button', () => {
    renderWithProviders(<NotFoundPage />);
    expect(screen.getByText('404 Error')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Return Home')).toBeInTheDocument();
  });
});
