import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { ProjectActivity } from '../models/ProjectActivity.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { notificationService } from '../services/notificationService.js';

/**
 * Helper to log project activities
 */
export const logActivity = async (projectId, userId, action, details = {}) => {
  try {
    await ProjectActivity.create({
      project: projectId,
      user: userId,
      action,
      details,
    });
  } catch (err) {
    console.error('Failed to log project activity:', err);
  }
};

/**
 * Create a new collaborative project
 * @route POST /api/projects
 */
export const createProject = async (req, res, next) => {
  try {
    const { title, description, technologies, repositoryUrl, liveUrl, status, deadline } = req.body;

    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      technologies: technologies || [],
      repositoryUrl: repositoryUrl || '',
      liveUrl: liveUrl || '',
      status: status || 'active',
      deadline: deadline ? new Date(deadline) : undefined,
    });

    await logActivity(project._id, req.user._id, 'PROJECT_CREATED', {
      projectTitle: title,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email profile.avatar')
      .populate('members.user', 'name email profile.avatar profile.department profile.semester');

    return sendSuccess(res, 'Project created successfully', { project: populatedProject }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * List projects with membership scoping and invitation filters
 * @route GET /api/projects
 */
export const getProjects = async (req, res, next) => {
  try {
    const { scope, status, search } = req.query;
    let query = {};

    if (scope === 'invitations') {
      // Find projects where user has a pending invitation
      query = {
        invitations: {
          $elemMatch: {
            user: req.user._id,
            status: 'pending',
          },
        },
      };
    } else if (req.user.role !== 'admin') {
      // Default: Find projects where user is owner or active member
      query = {
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      };
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email profile.avatar')
      .populate('members.user', 'name email profile.avatar')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, 'Projects retrieved successfully', { projects });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project details by ID with membership check
 * @route GET /api/projects/:id
 */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findById(id)
      .populate('owner', 'name email profile.avatar')
      .populate('members.user', 'name email profile.avatar profile.department profile.semester')
      .populate('invitations.user', 'name email profile.avatar')
      .populate('invitations.invitedBy', 'name email');

    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    // Membership or pending invitation check
    const isMember = project.members.some((m) => m.user._id.equals(req.user._id));
    const hasPendingInvite = project.invitations.some(
      (i) => i.user._id.equals(req.user._id) && i.status === 'pending'
    );

    if (req.user.role !== 'admin' && !isMember && !hasPendingInvite) {
      return next(ApiError.forbidden('You do not have access to this project workspace'));
    }

    return sendSuccess(res, 'Project retrieved successfully', {
      project,
      isMember,
      isOwner: project.owner._id.equals(req.user._id) || req.user.role === 'admin',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project metadata (Owner / Lead / Admin)
 * @route PATCH /api/projects/:id
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    // Ownership or Lead check
    const memberRecord = project.members.find((m) => m.user.equals(req.user._id));
    const isAuthorized =
      req.user.role === 'admin' ||
      project.owner.equals(req.user._id) ||
      (memberRecord && memberRecord.role === 'lead');

    if (!isAuthorized) {
      return next(ApiError.forbidden('You do not have permission to modify this project'));
    }

    const allowedFields = ['title', 'description', 'technologies', 'repositoryUrl', 'liveUrl', 'status', 'deadline'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'deadline') {
          project.deadline = req.body.deadline ? new Date(req.body.deadline) : undefined;
        } else {
          project[field] = req.body[field];
        }
      }
    });

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email profile.avatar')
      .populate('members.user', 'name email profile.avatar profile.department');

    return sendSuccess(res, 'Project updated successfully', { project: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project and associated tasks & activity logs
 * @route DELETE /api/projects/:id
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    if (req.user.role !== 'admin' && !project.owner.equals(req.user._id)) {
      return next(ApiError.forbidden('Only the project owner can delete this project'));
    }

    await Promise.all([
      Project.findByIdAndDelete(id),
      Task.deleteMany({ project: id }),
      ProjectActivity.deleteMany({ project: id }),
    ]);

    return sendSuccess(res, 'Project, tasks, and activity logs deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Invite a collaborator to the project
 * @route POST /api/projects/:id/invitations
 */
export const inviteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    // Owner / Lead check
    const isOwnerOrLead =
      req.user.role === 'admin' ||
      project.owner.equals(req.user._id) ||
      project.members.some((m) => m.user.equals(req.user._id) && m.role === 'lead');

    if (!isOwnerOrLead) {
      return next(ApiError.forbidden('You do not have permission to invite members to this project'));
    }

    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      return next(ApiError.notFound('No user registered with this email address'));
    }

    // Check if already a member
    if (project.members.some((m) => m.user.equals(targetUser._id))) {
      return next(ApiError.badRequest('User is already a member of this project'));
    }

    // Check if pending invitation already exists
    const existingInvite = project.invitations.find(
      (i) => i.user.equals(targetUser._id) && i.status === 'pending'
    );
    if (existingInvite) {
      return next(ApiError.badRequest('An invitation is already pending for this user'));
    }

    project.invitations.push({
      user: targetUser._id,
      invitedBy: req.user._id,
      status: 'pending',
      createdAt: new Date(),
    });

    await project.save();

    await logActivity(project._id, req.user._id, 'INVITATION_SENT', {
      targetEmail: targetUser.email,
      targetName: targetUser.name,
      role: role || 'member',
    });

    // Centralized notification delivery
    await notificationService.createNotification({
      recipient: targetUser._id,
      type: 'project_invitation',
      title: 'Project Invitation',
      message: `${req.user.name} invited you to join project "${project.title}"`,
      relatedResource: {
        kind: 'project',
        id: project._id,
        url: '/projects',
      },
    });

    return sendSuccess(res, `Invitation sent to ${targetUser.name}`, { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept or reject a project invitation
 * @route POST /api/projects/:id/invitations/respond
 */
export const respondInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    const invite = project.invitations.find(
      (i) => i.user.equals(req.user._id) && i.status === 'pending'
    );

    if (!invite) {
      return next(ApiError.notFound('No pending invitation found for you on this project'));
    }

    if (action === 'accept') {
      invite.status = 'accepted';
      // Add to members if not already
      if (!project.members.some((m) => m.user.equals(req.user._id))) {
        project.members.push({
          user: req.user._id,
          role: 'member',
          joinedAt: new Date(),
        });
      }

      await logActivity(project._id, req.user._id, 'MEMBER_JOINED', {
        userName: req.user.name,
      });
    } else {
      invite.status = 'rejected';
    }

    await project.save();

    return sendSuccess(
      res,
      action === 'accept' ? 'You joined the project!' : 'Invitation declined',
      { project }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a member from the project (Owner / Lead only)
 * @route DELETE /api/projects/:id/members/:userId
 */
export const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(ApiError.badRequest('Invalid ID format'));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    const isAuthorized =
      req.user.role === 'admin' || project.owner.equals(req.user._id);

    if (!isAuthorized) {
      return next(ApiError.forbidden('Only the project owner can remove team members'));
    }

    if (project.owner.equals(userId)) {
      return next(ApiError.badRequest('Cannot remove the project owner'));
    }

    project.members = project.members.filter((m) => !m.user.equals(userId));

    await project.save();

    await logActivity(project._id, req.user._id, 'MEMBER_REMOVED', {
      removedUserId: userId,
    });

    return sendSuccess(res, 'Member removed from project', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave a project (Member only)
 * @route POST /api/projects/:id/leave
 */
export const leaveProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    if (project.owner.equals(req.user._id)) {
      return next(
        ApiError.badRequest('Project owner cannot leave. Transfer ownership or delete the project.')
      );
    }

    const isMember = project.members.some((m) => m.user.equals(req.user._id));
    if (!isMember) {
      return next(ApiError.badRequest('You are not a member of this project'));
    }

    project.members = project.members.filter((m) => !m.user.equals(req.user._id));
    await project.save();

    await logActivity(project._id, req.user._id, 'MEMBER_LEFT', {
      userName: req.user.name,
    });

    return sendSuccess(res, 'You have left the project', null);
  } catch (error) {
    next(error);
  }
};
