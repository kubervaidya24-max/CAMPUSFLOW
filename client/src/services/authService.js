import apiClient from './apiClient';

export const authService = {
  /**
   * Register a new user account
   * @param {Object} userData
   * @returns {Promise<{success: boolean, message: string, data: { user: Object, accessToken: string }}>}
   */
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  /**
   * Sign in with email and password
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{success: boolean, message: string, data: { user: Object, accessToken: string }}>}
   */
  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  /**
   * Exchange refresh token for fresh access token
   * @param {string} [refreshToken]
   * @returns {Promise<{success: boolean, message: string, data: { accessToken: string }}>}
   */
  refreshToken: async (refreshToken = null) => {
    const payload = refreshToken ? { refreshToken } : {};
    return await apiClient.post('/auth/refresh', payload);
  },

  /**
   * Log out active user and clear session
   * @returns {Promise<{success: boolean, message: string}>}
   */
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },

  /**
   * Fetch current authenticated user profile
   * @returns {Promise<{success: boolean, message: string, data: { user: Object }}>}
   */
  getCurrentUser: async () => {
    return await apiClient.get('/auth/me');
  },
};

export default authService;
