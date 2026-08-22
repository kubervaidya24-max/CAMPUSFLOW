import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { ProjectActivity } from '../models/ProjectActivity.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Get high-level system metrics and platform stats.
 * @route GET /api/admin/stats
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalAdmins,
      activeUsers,
      suspendedUsers,
      totalCourses,
      publishedCourses,
      totalProjects,
      activeProjects,
      totalAssignments,
      totalSubmissions,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ isActive: false }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Assignment.countDocuments(),
      Submission.countDocuments(),
    ]);

    return sendSuccess(res, 'System stats retrieved successfully', {
      users: {
        total: totalStudents + totalFaculty + totalAdmins,
        students: totalStudents,
        faculty: totalFaculty,
        admins: totalAdmins,
        active: activeUsers,
        suspended: suspendedUsers,
      },
      academics: {
        totalCourses,
        publishedCourses,
        totalAssignments,
        totalSubmissions,
      },
      projects: {
        totalProjects,
        activeProjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated list of users with search and filter.
 * @route GET /api/admin/users
 */
export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { q, role, status, department } = req.query;

    const query = {};

    // 1. Text Search on name and email
    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    // 2. Role Filter
    if (role && ['student', 'faculty', 'admin'].includes(role)) {
      query.role = role;
    }

    // 3. Status Filter (active vs suspended)
    if (status === 'active') {
      query.isActive = { $ne: false };
    } else if (status === 'suspended') {
      query.isActive = false;
    }

    // 4. Department Filter
    if (department && department.trim()) {
      query['profile.department'] = { $regex: department.trim(), $options: 'i' };
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -refreshTokens'),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, 'Users retrieved successfully', {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user administrative attributes or suspend/reactivate account.
 * @route PATCH /api/admin/users/:id
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid user ID format'));
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return next(ApiError.notFound('User not found'));
    }

    const { isActive, role, department, semester } = req.body;

    // Prevent admin self-suspension to avoid lockout
    if (req.user._id.equals(targetUser._id) && isActive === false) {
      return next(ApiError.badRequest('Administrators cannot suspend their own account.'));
    }

    // Prevent admin from demoting themselves to avoid system lockout
    if (req.user._id.equals(targetUser._id) && role && role !== 'admin') {
      return next(ApiError.badRequest('Administrators cannot demote their own role.'));
    }

    if (typeof isActive === 'boolean') {
      targetUser.isActive = isActive;
    }

    if (role && ['student', 'faculty', 'admin'].includes(role)) {
      targetUser.role = role;
    }

    if (department !== undefined) {
      targetUser.profile.department = department;
    }

    if (semester !== undefined) {
      targetUser.profile.semester = semester;
    }

    await targetUser.save();

    return sendSuccess(res, 'User updated successfully', {
      user: targetUser.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated list of courses with filters.
 * @route GET /api/admin/courses
 */
export const getCourses = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { q, status, department } = req.query;

    const query = {};

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { code: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (status && ['draft', 'published', 'archived'].includes(status)) {
      query.status = status;
    }

    if (department && department.trim()) {
      query.department = { $regex: department.trim(), $options: 'i' };
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('faculty', 'name email profile.avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    return sendSuccess(res, 'Courses retrieved successfully', {
      courses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update course status or administrative moderation.
 * @route PATCH /api/admin/courses/:id
 */
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid course ID format'));
    }

    const { status, title, description } = req.body;

    const updateFields = {};
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      updateFields.status = status;
    }
    if (title && title.trim()) {
      updateFields.title = title.trim();
    }
    if (description !== undefined) {
      updateFields.description = description.trim();
    }

    const course = await Course.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('faculty', 'name email');

    if (!course) {
      return next(ApiError.notFound('Course not found'));
    }

    return sendSuccess(res, 'Course moderated successfully', { course });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete inappropriate course and cascaded resources.
 * @route DELETE /api/admin/courses/:id
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid course ID format'));
    }

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return next(ApiError.notFound('Course not found'));
    }

    // Cascade delete assignments and submissions
    const assignments = await Assignment.find({ course: id });
    const assignmentIds = assignments.map((a) => a._id);
    await Submission.deleteMany({ assignment: { $in: assignmentIds } });
    await Assignment.deleteMany({ course: id });

    return sendSuccess(res, 'Course and related assignments deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated list of projects with filters.
 * @route GET /api/admin/projects
 */
export const getProjects = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { q, status } = req.query;

    const query = {};

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (status && ['active', 'completed', 'archived'].includes(status)) {
      query.status = status;
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owner', 'name email profile.avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    return sendSuccess(res, 'Projects retrieved successfully', {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Moderate project status.
 * @route PATCH /api/admin/projects/:id
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const { status, title, description } = req.body;

    const updateFields = {};
    if (status && ['active', 'completed', 'archived'].includes(status)) {
      updateFields.status = status;
    }
    if (title && title.trim()) {
      updateFields.title = title.trim();
    }
    if (description !== undefined) {
      updateFields.description = description.trim();
    }

    const project = await Project.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email');

    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    return sendSuccess(res, 'Project moderated successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete inappropriate project and associated tasks.
 * @route DELETE /api/admin/projects/:id
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return next(ApiError.notFound('Project not found'));
    }

    await Task.deleteMany({ project: id });
    await ProjectActivity.deleteMany({ project: id });

    return sendSuccess(res, 'Project and related tasks deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get cross-platform activity audit reports and registration timeline.
 * @route GET /api/admin/reports
 */
export const getSystemReports = async (req, res, next) => {
  try {
    const [recentActivities, recentUsers] = await Promise.all([
      ProjectActivity.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('user', 'name email role')
        .populate('project', 'title'),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email role isActive createdAt profile.department'),
    ]);

    return sendSuccess(res, 'System audit reports retrieved successfully', {
      recentActivities,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};
