import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteMember,
  respondInvitation,
  removeMember,
  leaveProject,
} from '../controllers/projectController.js';
import {
  createTask,
  getTasksForProject,
  getProjectActivities,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  inviteMemberSchema,
  respondInvitationSchema,
  createTaskSchema,
} from '../validators/projectValidators.js';

const router = Router();

// Project CRUD
router.post('/', authenticate, validate(createProjectSchema), createProject);
router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProjectById);
router.patch('/:id', authenticate, validate(updateProjectSchema), updateProject);
router.delete('/:id', authenticate, deleteProject);

// Team Member & Invitation routes
router.post(
  '/:id/invitations',
  authenticate,
  validate(inviteMemberSchema),
  inviteMember
);
router.post(
  '/:id/invitations/respond',
  authenticate,
  validate(respondInvitationSchema),
  respondInvitation
);
router.delete('/:id/members/:userId', authenticate, removeMember);
router.post('/:id/leave', authenticate, leaveProject);

// Tasks & Activities under Project
router.post(
  '/:id/tasks',
  authenticate,
  validate(createTaskSchema),
  createTask
);
router.get('/:id/tasks', authenticate, getTasksForProject);
router.get('/:id/activities', authenticate, getProjectActivities);

export default router;
