import apiClient from './apiClient';

export const healthService = {
  /**
   * Fetch system health status from server
   * @returns {Promise<{success: boolean, message: string, data: any}>}
   */
  checkHealth: async () => {
    return await apiClient.get('/health');
  },
};
