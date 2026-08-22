import { Router } from 'express';
import {
  getStudentAnalytics,
  getProjectAnalytics,
  getPlacementAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

router.get('/student', getStudentAnalytics);
router.get('/overview', getStudentAnalytics);
router.get('/project/:projectId', getProjectAnalytics);
router.get('/placement', getPlacementAnalytics);

export default router;
