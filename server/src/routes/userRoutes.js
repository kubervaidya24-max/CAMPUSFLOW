import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getUserById,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/userValidators.js';

const router = Router();

// Protected profile routes
router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), updateMyProfile);
router.get('/:id', authenticate, getUserById);

export default router;
