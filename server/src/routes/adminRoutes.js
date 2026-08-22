import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  updateUser,
  getCourses,
  updateCourse,
  deleteCourse,
  getProjects,
  updateProject,
  deleteProject,
  getSystemReports,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Strict server-side security: Authentication & Admin Role Enforcement
router.use(authenticate);
router.use(authorize('admin'));

// Stats & Overview
router.get('/stats', getAdminStats);
router.get('/reports', getSystemReports);

// User Management & Suspension
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);

// Course Management & Moderation
router.get('/courses', getCourses);
router.patch('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Project Management & Moderation
router.get('/projects', getProjects);
router.patch('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

export default router;
