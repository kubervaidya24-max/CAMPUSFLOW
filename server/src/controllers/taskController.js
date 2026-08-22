import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { ProjectActivity } from '../models/ProjectActivity.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { logActivity } from './projectController.js';
import { notificationService } from '../services/notificationService.js';

/**
 * Create a new task in a project (Project members only)
 * @route POST /api/projects/:id/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assigneeId, priority, status, deadline } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    // Membership check
    const isMember = project.members.some((m) => m.user.equals(req.user._id));
    if (req.user.role !== 'admin' && !isMember) {
      return next(ApiError.forbidden('You must be a project member to create tasks'));
    }

    // Verify assignee if provided
    let validAssignee = undefined;
    if (assigneeId) {
      if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
        return next(ApiError.badRequest('Invalid assignee ID format'));
      }
      const isAssigneeMember = project.members.some((m) => m.user.equals(assigneeId));
      if (!isAssigneeMember) {
        return next(ApiError.badRequest('Assignee must be an active project member'));
      }
      validAssignee = assigneeId;
    }

    const task = await Task.create({
      project: project._id,
      title,
      description: description || '',
      assignee: validAssignee,
      creator: req.user._id,
      priority: priority || 'medium',
      status: status || 'TODO',
      deadline: deadline ? new Date(deadline) : undefined,
    });

    await logActivity(project._id, req.user._id, 'TASK_CREATED', {
      taskId: task._id,
      taskTitle: title,
      status: task.status,
    });

    // Notify assignee if not creator
    if (validAssignee && !req.user._id.equals(validAssignee)) {
      await notificationService.createNotification({
        recipient: validAssignee,
        type: 'task_assignment',
        title: 'New Task Assignment',
        message: `${req.user.name} assigned you to "${title}" in "${project.title}"`,
        relatedResource: {
          kind: 'task',
          id: task._id,
          url: `/projects/${project._id}`,
        },
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email profile.avatar')
      .populate('creator', 'name email profile.avatar');

    return sendSuccess(res, 'Task created successfully', { task: populatedTask }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks for a project (Project members only)
 * @route GET /api/projects/:id/tasks
 */
export const getTasksForProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    // Membership check
    const isMember = project.members.some((m) => m.user.equals(req.user._id));
    if (req.user.role !== 'admin' && !isMember) {
      return next(ApiError.forbidden('You do not have access to this project workspace'));
    }

    const tasks = await Task.find({ project: id })
      .populate('assignee', 'name email profile.avatar')
      .populate('creator', 'name email profile.avatar')
      .sort({ order: 1, createdAt: -1 });

    return sendSuccess(res, 'Tasks retrieved successfully', { tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task details (Project members only)
 * @route PATCH /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid task ID format'));
    }

    const task = await Task.findById(id);
    if (!task) {
      return next(ApiError.notFound('Task not found'));
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return next(ApiError.notFound('Associated project not found'));
    }

    // Membership check
    const isMember = project.members.some((m) => m.user.equals(req.user._id));
    if (req.user.role !== 'admin' && !isMember) {
      return next(ApiError.forbidden('You must be a project member to update tasks'));
    }

    const prevStatus = task.status;
    const allowedFields = ['title', 'description', 'assigneeId', 'priority', 'status', 'deadline', 'order'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'assigneeId') {
          task.assignee = req.body.assigneeId ? req.body.assigneeId : null;
        } else if (field === 'deadline') {
          task.deadline = req.body.deadline ? new Date(req.body.deadline) : null;
        } else {
          task[field] = req.body[field];
        }
      }
    });

    await task.save();

    // Log activity if status shifted
    if (req.body.status && req.body.status !== prevStatus) {
      const action = req.body.status === 'DONE' ? 'TASK_COMPLETED' : 'TASK_MOVED';
      await logActivity(project._id, req.user._id, action, {
        taskTitle: task.title,
        fromStatus: prevStatus,
        toStatus: req.body.status,
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email profile.avatar')
      .populate('creator', 'name email profile.avatar');

    return sendSuccess(res, 'Task updated successfully', { task: updatedTask });
  } catch (error) {
    next(error);
  }
};

/**
 * Quick status update for Kanban board drag & drop / button shift
 * @route PATCH /api/tasks/:id/status
 */
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid task ID format'));
    }

    const task = await Task.findById(id);
    if (!task) {
      return next(ApiError.notFound('Task not found'));
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    const isMember = project.members.some((m) => m.user.equals(req.user._id));
    if (req.user.role !== 'admin' && !isMember) {
      return next(ApiError.forbidden('You must be a project member to move tasks'));
    }

    const prevStatus = task.status;
    task.status = status;
    await task.save();

    const action = status === 'DONE' ? 'TASK_COMPLETED' : 'TASK_MOVED';
    await logActivity(project._id, req.user._id, action, {
      taskTitle: task.title,
      fromStatus: prevStatus,
      toStatus: status,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email profile.avatar')
      .populate('creator', 'name email profile.avatar');

    return sendSuccess(res, `Task moved to ${status}`, { task: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task (Project members only)
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid task ID format'));
    }

    const task = await Task.findById(id);
    if (!task) {
      return next(ApiError.notFound('Task not found'));
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    const isMember = project.members.some((m) => m.user.equals(req.user._id));
    if (req.user.role !== 'admin' && !isMember) {
      return next(ApiError.forbidden('You must be a project member to delete tasks'));
    }

    await Task.findByIdAndDelete(id);

    await logActivity(project._id, req.user._id, 'TASK_DELETED', {
      taskTitle: task.title,
    });

    return sendSuccess(res, 'Task deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Get project activity audit feed
 * @route GET /api/projects/:id/activities
 */
export const getProjectActivities = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    // Membership check
    const isMember = project.members.some((m) => m.user.equals(req.user._id));
    if (req.user.role !== 'admin' && !isMember) {
      return next(ApiError.forbidden('You do not have access to this project audit log'));
    }

    const activities = await ProjectActivity.find({ project: id })
      .populate('user', 'name email profile.avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, 'Project activities retrieved successfully', { activities });
  } catch (error) {
    next(error);
  }
};
