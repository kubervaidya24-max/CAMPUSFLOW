import apiClient from './apiClient';

export const analyticsService = {
  /**
   * Get holistic student analytics (academic, assignments, projects, career)
   */
  getStudentAnalytics: async () => {
    return await apiClient.get('/analytics/student');
  },

  /**
   * Get project-specific analytics (task distribution, member contribution, activity)
   * @param {string} projectId
   */
  getProjectAnalytics: async (projectId) => {
    return await apiClient.get(`/analytics/project/${projectId}`);
  },

  /**
   * Get placement & career pipeline analytics
   */
  getPlacementAnalytics: async () => {
    return await apiClient.get('/analytics/placement');
  },
};

export default analyticsService;
