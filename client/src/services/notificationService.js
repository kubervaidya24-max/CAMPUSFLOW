import apiClient from './apiClient';

export const notificationService = {
  /**
   * Get user's notifications with pagination
   * @param {Object} params - { page, limit, unreadOnly }
   */
  getNotifications: async (params = {}) => {
    return await apiClient.get('/notifications', { params });
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    return await apiClient.get('/notifications/unread-count');
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId
   */
  markAsRead: async (notificationId) => {
    return await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    return await apiClient.patch('/notifications/read-all');
  },

  /**
   * Delete a notification
   * @param {string} notificationId
   */
  deleteNotification: async (notificationId) => {
    return await apiClient.delete(`/notifications/${notificationId}`);
  },
};

export default notificationService;
