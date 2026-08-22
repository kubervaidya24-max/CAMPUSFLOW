import { Router } from 'express';
import {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  autoFillResume,
} from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createResumeSchema,
  updateResumeSchema,
} from '../validators/resumeValidators.js';

const router = Router();

// All resume routes require authentication
router.use(authenticate);

router.get('/auto-fill', autoFillResume);
router.get('/', getResumes);
router.post('/', validate(createResumeSchema), createResume);
router.get('/:id', getResumeById);
router.patch('/:id', validate(updateResumeSchema), updateResume);
router.delete('/:id', deleteResume);

export default router;
