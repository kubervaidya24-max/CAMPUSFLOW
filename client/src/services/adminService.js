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
   * @param {object} data { status, isArchived }
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
   * Get system reports and recent activity metrics
   */
  getReports: async () => {
    return await apiClient.get('/admin/reports');
  },

  // ==========================
  // MUST-TO-DO DSA SHEET APIS
  // ==========================

  /**
   * Get Admin Must-to-Do DSA Sheet overview
   */
  getAdminDSASheet: async () => {
    return await apiClient.get('/admin/dsa-sheet');
  },

  /**
   * Update Must-to-Do Sheet metadata
   * @param {object} data { title, description }
   */
  updateDSASheetMetadata: async (data) => {
    return await apiClient.patch('/admin/dsa-sheet', data);
  },

  /**
   * Toggle publish / draft status of the sheet
   * @param {boolean} isPublished
   */
  togglePublishDSASheet: async (isPublished) => {
    return await apiClient.patch('/admin/dsa-sheet/publish', { isPublished });
  },

  /**
   * Add a question to the sheet
   * @param {object} data
   */
  addDSASheetQuestion: async (data) => {
    return await apiClient.post('/admin/dsa-sheet/questions', data);
  },

  /**
   * Update question in the sheet
   * @param {string} questionId
   * @param {object} data
   */
  updateDSASheetQuestion: async (questionId, data) => {
    return await apiClient.patch(`/admin/dsa-sheet/questions/${questionId}`, data);
  },

  /**
   * Remove question from the sheet
   * @param {string} questionId
   */
  deleteDSASheetQuestion: async (questionId) => {
    return await apiClient.delete(`/admin/dsa-sheet/questions/${questionId}`);
  },

  /**
   * Reorder questions
   * @param {string[]} questionIds
   */
  reorderDSASheetQuestions: async (questionIds) => {
    return await apiClient.patch('/admin/dsa-sheet/questions/reorder', { questionIds });
  },
};

export default adminService;
