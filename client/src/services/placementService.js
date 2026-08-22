import apiClient from './apiClient';

export const placementService = {
  // ==========================
  // DSA PROBLEM APIS
  // ==========================

  /**
   * Get filtered DSA problems
   * @param {Object} params - { page, limit, topic, difficulty, status, platform, search }
   */
  getDSAProblems: async (params = {}) => {
    return await apiClient.get('/placements/dsa', { params });
  },

  /**
   * Get dynamic calculated DSA analytics
   */
  getDSAAnalytics: async () => {
    return await apiClient.get('/placements/dsa/analytics');
  },

  /**
   * Create new DSA problem entry
   * @param {Object} data
   */
  createDSAProblem: async (data) => {
    return await apiClient.post('/placements/dsa', data);
  },

  /**
   * Get single DSA problem by ID
   * @param {string} id
   */
  getDSAProblem: async (id) => {
    return await apiClient.get(`/placements/dsa/${id}`);
  },

  /**
   * Update DSA problem entry
   * @param {string} id
   * @param {Object} data
   */
  updateDSAProblem: async (id, data) => {
    return await apiClient.patch(`/placements/dsa/${id}`, data);
  },

  /**
   * Delete DSA problem entry
   * @param {string} id
   */
  deleteDSAProblem: async (id) => {
    return await apiClient.delete(`/placements/dsa/${id}`);
  },

  // ==========================
  // JOB APPLICATION APIS
  // ==========================

  /**
   * Get job applications list with filters
   * @param {Object} params - { status, search }
   */
  getJobApplications: async (params = {}) => {
    return await apiClient.get('/placements/jobs', { params });
  },

  /**
   * Get grouped job application visual pipeline
   */
  getJobPipeline: async () => {
    return await apiClient.get('/placements/jobs/pipeline');
  },

  /**
   * Create new job application
   * @param {Object} data
   */
  createJobApplication: async (data) => {
    return await apiClient.post('/placements/jobs', data);
  },

  /**
   * Get single job application by ID
   * @param {string} id
   */
  getJobApplication: async (id) => {
    return await apiClient.get(`/placements/jobs/${id}`);
  },

  /**
   * Update job application stage / details
   * @param {string} id
   * @param {Object} data
   */
  updateJobApplication: async (id, data) => {
    return await apiClient.patch(`/placements/jobs/${id}`, data);
  },

  /**
   * Delete job application
   * @param {string} id
   */
  deleteJobApplication: async (id) => {
    return await apiClient.delete(`/placements/jobs/${id}`);
  },
};

export default placementService;
