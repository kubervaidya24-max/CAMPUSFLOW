import apiClient from './apiClient';

export const assignmentService = {
  /**
   * List assignments with optional filters
   * @param {Object} params - { courseId, status }
   */
  getAssignments: async (params = {}) => {
    return await apiClient.get('/assignments', { params });
  },

  /**
   * Get single assignment by ID
   * @param {string} assignmentId
   */
  getAssignmentById: async (assignmentId) => {
    return await apiClient.get(`/assignments/${assignmentId}`);
  },

  /**
   * Create new assignment (Faculty / Admin)
   * @param {Object} assignmentData
   */
  createAssignment: async (assignmentData) => {
    return await apiClient.post('/assignments', assignmentData);
  },

  /**
   * Update existing assignment (Faculty owner / Admin)
   * @param {string} assignmentId
   * @param {Object} updateData
   */
  updateAssignment: async (assignmentId, updateData) => {
    return await apiClient.patch(`/assignments/${assignmentId}`, updateData);
  },

  /**
   * Delete assignment (Faculty owner / Admin)
   * @param {string} assignmentId
   */
  deleteAssignment: async (assignmentId) => {
    return await apiClient.delete(`/assignments/${assignmentId}`);
  },

  /**
   * Submit or resubmit an assignment (Student)
   * @param {string} assignmentId
   * @param {Object} submissionData - { content, attachments }
   */
  submitAssignment: async (assignmentId, submissionData) => {
    return await apiClient.post(`/assignments/${assignmentId}/submit`, submissionData);
  },

  /**
   * Get all submissions for an assignment (Faculty owner / Admin)
   * @param {string} assignmentId
   */
  getSubmissionsForAssignment: async (assignmentId) => {
    return await apiClient.get(`/assignments/${assignmentId}/submissions`);
  },

  /**
   * Get current student's all submissions
   */
  getMySubmissions: async () => {
    return await apiClient.get('/submissions/me');
  },

  /**
   * Grade a submission (Faculty owner / Admin)
   * @param {string} submissionId
   * @param {Object} gradeData - { score, feedback }
   */
  gradeSubmission: async (submissionId, gradeData) => {
    return await apiClient.patch(`/submissions/${submissionId}/grade`, gradeData);
  },
};

export default assignmentService;
