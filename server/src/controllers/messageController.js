import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { Project } from '../models/Project.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Get chat message history for a project (Members only)
 * @route GET /api/projects/:id/messages
 */
export const getProjectMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const before = req.query.before;

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
      return next(ApiError.forbidden('You do not have access to this project chat history'));
    }

    const query = { project: id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('sender', 'name email role profile.avatar');

    return sendSuccess(res, 'Project messages retrieved successfully', {
      messages,
      count: messages.length,
    });
  } catch (error) {
    next(error);
  }
};
