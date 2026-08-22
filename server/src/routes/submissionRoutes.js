import { Router } from 'express';
import {
  getMySubmissions,
  gradeSubmission,
} from '../controllers/submissionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { gradeSubmissionSchema } from '../validators/assignmentValidators.js';

const router = Router();

// Student my-submissions list
router.get('/me', authenticate, authorize('student'), getMySubmissions);

// Faculty grading endpoint
router.patch(
  '/:id/grade',
  authenticate,
  authorize('faculty', 'admin'),
  validate(gradeSubmissionSchema),
  gradeSubmission
);

export default router;
