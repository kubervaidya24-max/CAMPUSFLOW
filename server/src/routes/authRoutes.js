import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/authValidators.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
