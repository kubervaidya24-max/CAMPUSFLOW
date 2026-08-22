import apiClient from './apiClient';

export const adminService = {
  /**
   * Get overall system metrics
   */
  getStats: async () => {
    return await apiClient.get('/admin/stats');
  },

  /**
   * Get paginated users list
   * @param {object} params { page, limit, q, role, status, department }
   */
  getUsers: async (params = {}) => {
    return await apiClient.get('/admin/users', { params });
  },

  /**
   * Update user administrative attributes or status
   * @param {string} userId
   * @param {object} data { isActive, role, department, semester }
   */
  updateUser: async (userId, data) => {
    return await apiClient.patch(`/admin/users/${userId}`, data);
  },

  /**
   * Get paginated courses list
   * @param {object} params { page, limit, q, status, department }
   */
  getCourses: async (params = {}) => {
    return await apiClient.get('/admin/courses', { params });
  },

  /**
   * Moderate course
   * @param {string} courseId
   * @param {object} data { status, title, description }
   */
  updateCourse: async (courseId, data) => {
    return await apiClient.patch(`/admin/courses/${courseId}`, data);
  },

  /**
   * Delete course
   * @param {string} courseId
   */
  deleteCourse: async (courseId) => {
    return await apiClient.delete(`/admin/courses/${courseId}`);
  },

  /**
   * Get paginated projects list
   * @param {object} params { page, limit, q, status }
   */
  getProjects: async (params = {}) => {
    return await apiClient.get('/admin/projects', { params });
  },

  /**
   * Moderate project
   * @param {string} projectId
   * @param {object} data { status, title, description }
   */
  updateProject: async (projectId, data) => {
    return await apiClient.patch(`/admin/projects/${projectId}`, data);
  },

  /**
   * Delete project
   * @param {string} projectId
   */
  deleteProject: async (projectId) => {
    return await apiClient.delete(`/admin/projects/${projectId}`);
  },

  /**
   * Get system reports and activity audit stream
   */
  getReports: async () => {
    return await apiClient.get('/admin/reports');
  },
};

export default adminService;
