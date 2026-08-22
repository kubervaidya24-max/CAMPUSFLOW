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
import {
  getAdminSheet,
  updateSheetMetadata,
  togglePublishSheet,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from '../controllers/dsaSheetController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateSheetMetadataSchema,
  togglePublishSheetSchema,
  addQuestionSchema,
  updateQuestionSchema,
  reorderQuestionsSchema,
} from '../validators/dsaSheetValidators.js';

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

// ==========================================
// ADMIN MUST-TO-DO DSA SHEET MANAGEMENT
// ==========================================
router.get('/dsa-sheet', getAdminSheet);
router.patch('/dsa-sheet', validate(updateSheetMetadataSchema), updateSheetMetadata);
router.patch('/dsa-sheet/publish', validate(togglePublishSheetSchema), togglePublishSheet);
router.post('/dsa-sheet/questions', validate(addQuestionSchema), addQuestion);
router.patch('/dsa-sheet/questions/reorder', validate(reorderQuestionsSchema), reorderQuestions);
router.patch('/dsa-sheet/questions/:questionId', validate(updateQuestionSchema), updateQuestion);
router.delete('/dsa-sheet/questions/:questionId', deleteQuestion);

export default router;
