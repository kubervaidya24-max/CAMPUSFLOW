import apiClient from './apiClient';

export const resumeService = {
  /**
   * Get all resumes for authenticated user
   */
  getResumes: async () => {
    return await apiClient.get('/resumes');
  },

  /**
   * Get single resume by ID
   * @param {string} id
   */
  getResumeById: async (id) => {
    return await apiClient.get(`/resumes/${id}`);
  },

  /**
   * Create a new resume
   * @param {Object} resumeData
   */
  createResume: async (resumeData) => {
    return await apiClient.post('/resumes', resumeData);
  },

  /**
   * Update existing resume
   * @param {string} id
   * @param {Object} resumeData
   */
  updateResume: async (id, resumeData) => {
    return await apiClient.patch(`/resumes/${id}`, resumeData);
  },

  /**
   * Delete resume
   * @param {string} id
   */
  deleteResume: async (id) => {
    return await apiClient.delete(`/resumes/${id}`);
  },

  /**
   * Get auto-filled draft resume from user profile & projects
   */
  getAutoFillDraft: async () => {
    return await apiClient.get('/resumes/auto-fill');
  },
};

export default resumeService;
