import { Router } from 'express';
import {
  getDSAProblems,
  createDSAProblem,
  getDSAProblemById,
  updateDSAProblem,
  deleteDSAProblem,
  getDSAAnalytics,
  getJobApplications,
  createJobApplication,
  getJobApplicationById,
  updateJobApplication,
  deleteJobApplication,
  getJobPipeline,
} from '../controllers/placementController.js';
import {
  getPublishedSheet,
  updateQuestionProgress,
} from '../controllers/dsaSheetController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createDSAProblemSchema,
  updateDSAProblemSchema,
  createJobApplicationSchema,
  updateJobApplicationSchema,
} from '../validators/placementValidators.js';
import { updateProgressSchema } from '../validators/dsaSheetValidators.js';

const router = Router();

// All placement routes require authentication
router.use(authenticate);

// ==========================================
// MUST-TO-DO DSA SHEET (AUTHENTICATED USERS)
// ==========================================
router.get('/sheet', getPublishedSheet);
router.patch('/sheet/progress/:questionId', validate(updateProgressSchema), updateQuestionProgress);

// ==========================================
// PERSONAL DSA PROBLEM TRACKER
// ==========================================
router.get('/dsa/analytics', getDSAAnalytics);
router.get('/dsa', getDSAProblems);
router.post('/dsa', validate(createDSAProblemSchema), createDSAProblem);
router.get('/dsa/:id', getDSAProblemById);
router.patch('/dsa/:id', validate(updateDSAProblemSchema), updateDSAProblem);
router.delete('/dsa/:id', deleteDSAProblem);

// ==========================================
// JOB APPLICATION PIPELINE
// ==========================================
router.get('/jobs/pipeline', getJobPipeline);
router.get('/jobs', getJobApplications);
router.post('/jobs', validate(createJobApplicationSchema), createJobApplication);
router.get('/jobs/:id', getJobApplicationById);
router.patch('/jobs/:id', validate(updateJobApplicationSchema), updateJobApplication);
router.delete('/jobs/:id', deleteJobApplication);

export default router;
