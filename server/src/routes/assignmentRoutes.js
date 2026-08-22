import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import {
  submitAssignment,
  getSubmissionsForAssignment,
} from '../controllers/submissionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  createSubmissionSchema,
} from '../validators/assignmentValidators.js';

const router = Router();

// Assignment CRUD
router.post(
  '/',
  authenticate,
  authorize('faculty', 'admin'),
  validate(createAssignmentSchema),
  createAssignment
);
router.get('/', authenticate, getAssignments);
router.get('/:id', authenticate, getAssignmentById);
router.patch(
  '/:id',
  authenticate,
  authorize('faculty', 'admin'),
  validate(updateAssignmentSchema),
  updateAssignment
);
router.delete('/:id', authenticate, authorize('faculty', 'admin'), deleteAssignment);

// Student Submission & Faculty Submissions List
router.post(
  '/:id/submit',
  authenticate,
  authorize('student'),
  validate(createSubmissionSchema),
  submitAssignment
);
router.get(
  '/:id/submissions',
  authenticate,
  authorize('faculty', 'admin'),
  getSubmissionsForAssignment
);

export default router;
