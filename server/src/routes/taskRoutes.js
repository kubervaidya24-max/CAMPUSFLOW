import { Router } from 'express';
import {
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/projectValidators.js';

const router = Router();

// Task detail update, status shift, and deletion
router.patch('/:id', authenticate, validate(updateTaskSchema), updateTask);
router.patch('/:id/status', authenticate, validate(updateTaskStatusSchema), updateTaskStatus);
router.delete('/:id', authenticate, deleteTask);

export default router;
