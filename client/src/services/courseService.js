import apiClient from './apiClient';

export const courseService = {
  /**
   * Fetch courses with query filters
   * @param {Object} params - { department, semester, status, search, enrolled, facultyOnly, page, limit }
   */
  getCourses: async (params = {}) => {
    return await apiClient.get('/courses', { params });
  },

  /**
   * Fetch a single course by ID
   * @param {string} courseId
   */
  getCourseById: async (courseId) => {
    return await apiClient.get(`/courses/${courseId}`);
  },

  /**
   * Create a new course (Faculty / Admin)
   * @param {Object} courseData
   */
  createCourse: async (courseData) => {
    return await apiClient.post('/courses', courseData);
  },

  /**
   * Update an existing course (Faculty owner / Admin)
   * @param {string} courseId
   * @param {Object} updateData
   */
  updateCourse: async (courseId, updateData) => {
    return await apiClient.patch(`/courses/${courseId}`, updateData);
  },

  /**
   * Delete a course (Faculty owner / Admin)
   * @param {string} courseId
   */
  deleteCourse: async (courseId) => {
    return await apiClient.delete(`/courses/${courseId}`);
  },

  /**
   * Enroll in a course (Student)
   * @param {string} courseId
   */
  enrollCourse: async (courseId) => {
    return await apiClient.post(`/courses/${courseId}/enroll`);
  },

  /**
   * Leave / unenroll from a course (Student)
   * @param {string} courseId
   */
  unenrollCourse: async (courseId) => {
    return await apiClient.delete(`/courses/${courseId}/enroll`);
  },
};

export default courseService;
