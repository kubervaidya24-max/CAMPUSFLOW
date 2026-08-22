import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { setAuthToken } from '../services/apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app load
  const initializeAuth = useCallback(async () => {
    try {
      // First attempt to refresh token via HTTP-only cookie
      const refreshRes = await authService.refreshToken();
      if (refreshRes?.data?.accessToken) {
        const token = refreshRes.data.accessToken;
        setAccessToken(token);
        setAuthToken(token);

        // Fetch user profile
        const userRes = await authService.getCurrentUser();
        if (userRes?.data?.user) {
          setUser(userRes.data.user);
        }
      }
    } catch {
      // No active session or refresh expired
      setUser(null);
      setAccessToken(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login handler
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { user: loggedInUser, accessToken: token } = response.data;
    setUser(loggedInUser);
    setAccessToken(token);
    setAuthToken(token);
    return response;
  };

  // Register handler
  const register = async (userData) => {
    const response = await authService.register(userData);
    const { user: newUser, accessToken: token } = response.data;
    setUser(newUser);
    setAccessToken(token);
    setAuthToken(token);
    return response;
  };

  // Update user in state after profile update
  const updateUser = (newUserData) => {
    setUser((prev) => ({
      ...prev,
      ...newUserData,
      profile: {
        ...prev?.profile,
        ...newUserData?.profile,
        socialLinks: {
          ...prev?.profile?.socialLinks,
          ...newUserData?.profile?.socialLinks,
        },
      },
    }));
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('[Logout Warning] Error contacting logout endpoint:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setAuthToken(null);
    }
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
