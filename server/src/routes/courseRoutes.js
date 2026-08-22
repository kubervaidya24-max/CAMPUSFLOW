import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
} from '../controllers/courseController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCourseSchema, updateCourseSchema } from '../validators/courseValidators.js';

const router = Router();

// Course CRUD routes
router.post('/', authenticate, authorize('faculty', 'admin'), validate(createCourseSchema), createCourse);
router.get('/', authenticate, getCourses);
router.get('/:id', authenticate, getCourseById);
router.patch('/:id', authenticate, authorize('faculty', 'admin'), validate(updateCourseSchema), updateCourse);
router.delete('/:id', authenticate, authorize('faculty', 'admin'), deleteCourse);

// Student Enrollment routes
router.post('/:id/enroll', authenticate, authorize('student'), enrollInCourse);
router.delete('/:id/enroll', authenticate, authorize('student'), unenrollFromCourse);

export default router;
