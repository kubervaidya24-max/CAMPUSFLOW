import apiClient from './apiClient';

export const userService = {
  /**
   * Fetch current authenticated user's profile
   * @returns {Promise<{success: boolean, message: string, data: { user: Object }}>}
   */
  getMyProfile: async () => {
    return await apiClient.get('/users/me');
  },

  /**
   * Update current authenticated user's profile
   * @param {Object} updateData - Whitelisted fields: name, profile { avatar, bio, department, semester, skills, interests, socialLinks, designation, subjects, officeLocation }
   * @returns {Promise<{success: boolean, message: string, data: { user: Object }}>}
   */
  updateMyProfile: async (updateData) => {
    return await apiClient.patch('/users/me', updateData);
  },

  /**
   * Fetch public profile of a user by ID
   * @param {string} userId
   * @returns {Promise<{success: boolean, message: string, data: { user: Object }}>}
   */
  getUserById: async (userId) => {
    return await apiClient.get(`/users/${userId}`);
  },
};

export default userService;
