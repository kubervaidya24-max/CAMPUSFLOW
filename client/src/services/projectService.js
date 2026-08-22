import apiClient from './apiClient';

export const projectService = {
  /**
   * List projects with optional filter
   * @param {Object} params - { scope, status, search }
   */
  getProjects: async (params = {}) => {
    return await apiClient.get('/projects', { params });
  },

  /**
   * Get single project by ID with members & invitations
   * @param {string} projectId
   */
  getProjectById: async (projectId) => {
    return await apiClient.get(`/projects/${projectId}`);
  },

  /**
   * Create a new project
   * @param {Object} projectData
   */
  createProject: async (projectData) => {
    return await apiClient.post('/projects', projectData);
  },

  /**
   * Update project metadata
   * @param {string} projectId
   * @param {Object} updateData
   */
  updateProject: async (projectId, updateData) => {
    return await apiClient.patch(`/projects/${projectId}`, updateData);
  },

  /**
   * Delete project
   * @param {string} projectId
   */
  deleteProject: async (projectId) => {
    return await apiClient.delete(`/projects/${projectId}`);
  },

  /**
   * Invite member to project
   * @param {string} projectId
   * @param {Object} inviteData - { email, role }
   */
  inviteMember: async (projectId, inviteData) => {
    return await apiClient.post(`/projects/${projectId}/invitations`, inviteData);
  },

  /**
   * Accept or decline invitation
   * @param {string} projectId
   * @param {Object} responseData - { action: 'accept' | 'reject' }
   */
  respondInvitation: async (projectId, responseData) => {
    return await apiClient.post(`/projects/${projectId}/invitations/respond`, responseData);
  },

  /**
   * Remove member from project (Owner/Lead)
   * @param {string} projectId
   * @param {string} userId
   */
  removeMember: async (projectId, userId) => {
    return await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },

  /**
   * Leave project
   * @param {string} projectId
   */
  leaveProject: async (projectId) => {
    return await apiClient.post(`/projects/${projectId}/leave`);
  },

  /**
   * Get all tasks for a project
   * @param {string} projectId
   */
  getTasks: async (projectId) => {
    return await apiClient.get(`/projects/${projectId}/tasks`);
  },

  /**
   * Create task in a project
   * @param {string} projectId
   * @param {Object} taskData
   */
  createTask: async (projectId, taskData) => {
    return await apiClient.post(`/projects/${projectId}/tasks`, taskData);
  },

  /**
   * Update task details
   * @param {string} taskId
   * @param {Object} updateData
   */
  updateTask: async (taskId, updateData) => {
    return await apiClient.patch(`/tasks/${taskId}`, updateData);
  },

  /**
   * Quick status shift (TODO -> IN_PROGRESS -> DONE)
   * @param {string} taskId
   * @param {string} status
   */
  updateTaskStatus: async (taskId, status) => {
    return await apiClient.patch(`/tasks/${taskId}/status`, { status });
  },

  /**
   * Delete task
   * @param {string} taskId
   */
  deleteTask: async (taskId) => {
    return await apiClient.delete(`/tasks/${taskId}`);
  },

  /**
   * Get project activity log
   * @param {string} projectId
   */
  getActivities: async (projectId) => {
    return await apiClient.get(`/projects/${projectId}/activities`);
  },

  /**
   * Get chat message history for project
   * @param {string} projectId
   * @param {Object} params - { limit, before }
   */
  getProjectMessages: async (projectId, params = {}) => {
    return await apiClient.get(`/projects/${projectId}/messages`, { params });
  },
};

export default projectService;
