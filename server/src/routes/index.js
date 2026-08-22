import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import courseRoutes from './courseRoutes.js';
import assignmentRoutes from './assignmentRoutes.js';
import submissionRoutes from './submissionRoutes.js';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);

export default router;
