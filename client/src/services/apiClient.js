import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for consistent error unwrapping
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Network communication error',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
      raw: error,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
