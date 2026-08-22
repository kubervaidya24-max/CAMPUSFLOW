import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn().mockRejectedValue(new Error('No refresh token')),
    getCurrentUser: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
  },
}));

const renderWithProviders = (ui, { route = '/' } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Client Authentication Views & Guards', () => {
  it('renders LoginPage with form controls and validation on empty submit', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@college.edu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Email address is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('renders RegisterPage with role selector and password strength indicators', async () => {
    renderWithProviders(<RegisterPage />, { route: '/register' });

    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Student/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Faculty/i })).toBeInTheDocument();

    // Type a partial password to trigger strength indicator
    const passwordInput = screen.getByPlaceholderText('Create strong password');
    fireEvent.change(passwordInput, { target: { value: 'Pass1!' } });

    expect(screen.getByText('Password Strength')).toBeInTheDocument();
  });

  it('redirects unauthenticated users trying to access ProtectedRoute to /login', async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Secret Dashboard Area</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Screen Reached</div>} />
      </Routes>,
      { route: '/protected' }
    );

    expect(await screen.findByText('Login Screen Reached')).toBeInTheDocument();
    expect(screen.queryByText('Secret Dashboard Area')).not.toBeInTheDocument();
  });
});
