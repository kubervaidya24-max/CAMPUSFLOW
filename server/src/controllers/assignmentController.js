import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment.js';
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Create a new assignment (Faculty owner / Admin only)
 * @route POST /api/assignments
 */
export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, courseId, dueDate, totalPoints, allowLate, attachments, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return next(ApiError.badRequest('Invalid course ID format'));
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return next(ApiError.notFound('Course not found'));
    }

    // Ownership check: must be course instructor or admin
    if (req.user.role !== 'admin' && !course.faculty.equals(req.user._id)) {
      return next(ApiError.forbidden('You do not have permission to add assignments to this course'));
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: course._id,
      faculty: req.user._id,
      dueDate: new Date(dueDate),
      totalPoints: totalPoints || 100,
      allowLate: allowLate !== undefined ? allowLate : true,
      attachments: attachments || [],
      status: status || 'published',
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title code department semester')
      .populate('faculty', 'name email profile.avatar');

    return sendSuccess(res, 'Assignment created successfully', { assignment: populatedAssignment }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * List assignments with role-aware filters
 * @route GET /api/assignments
 */
export const getAssignments = async (req, res, next) => {
  try {
    const { courseId, status } = req.query;
    const query = {};

    if (courseId) {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(ApiError.badRequest('Invalid course ID format'));
      }
      query.course = courseId;
    }

    if (status) {
      query.status = status;
    }

    // Role-specific scoping
    if (req.user.role === 'student' && !courseId) {
      // Find courses where student is enrolled
      const enrolledCourses = await Course.find({
        'enrolledStudents.student': req.user._id,
      }).select('_id');
      const enrolledCourseIds = enrolledCourses.map((c) => c._id);
      query.course = { $in: enrolledCourseIds };
      query.status = 'published';
    } else if (req.user.role === 'faculty' && !courseId) {
      query.faculty = req.user._id;
    }

    const assignments = await Assignment.find(query)
      .populate('course', 'title code department semester')
      .populate('faculty', 'name email profile.avatar')
      .sort({ dueDate: 1 });

    // If student, attach submission status for each assignment
    let result = assignments;
    if (req.user.role === 'student') {
      const assignmentIds = assignments.map((a) => a._id);
      const studentSubmissions = await Submission.find({
        assignment: { $in: assignmentIds },
        student: req.user._id,
      });

      const submissionMap = new Map();
      studentSubmissions.forEach((sub) => {
        submissionMap.set(sub.assignment.toString(), sub);
      });

      result = assignments.map((a) => {
        const sub = submissionMap.get(a._id.toString());
        const json = a.toJSON();
        json.mySubmission = sub ? sub.toJSON() : null;
        json.submissionStatus = sub ? sub.status : 'pending';
        return json;
      });
    }

    return sendSuccess(res, 'Assignments retrieved successfully', { assignments: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed assignment by ID
 * @route GET /api/assignments/:id
 */
export const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid assignment ID format'));
    }

    const assignment = await Assignment.findById(id)
      .populate('course', 'title code department semester faculty')
      .populate('faculty', 'name email profile.avatar profile.designation');

    if (!assignment) {
      return next(ApiError.notFound('Assignment not found'));
    }

    const responseData = { assignment: assignment.toJSON() };

    // If student, fetch their submission
    if (req.user.role === 'student') {
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user._id,
      });
      responseData.mySubmission = submission ? submission.toJSON() : null;
    } else {
      // If faculty/admin, get submission stats
      const totalSubmissions = await Submission.countDocuments({ assignment: assignment._id });
      const gradedSubmissions = await Submission.countDocuments({
        assignment: assignment._id,
        status: 'graded',
      });
      responseData.stats = { totalSubmissions, gradedSubmissions };
    }

    return sendSuccess(res, 'Assignment retrieved successfully', responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an assignment (Faculty owner / Admin only)
 * @route PATCH /api/assignments/:id
 */
export const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid assignment ID format'));
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return next(ApiError.notFound('Assignment not found'));
    }

    // Ownership check
    if (req.user.role !== 'admin' && !assignment.faculty.equals(req.user._id)) {
      return next(ApiError.forbidden('You do not have permission to modify this assignment'));
    }

    const allowedFields = ['title', 'description', 'dueDate', 'totalPoints', 'allowLate', 'attachments', 'status'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'dueDate') {
          assignment.dueDate = new Date(req.body.dueDate);
        } else {
          assignment[field] = req.body[field];
        }
      }
    });

    await assignment.save();

    const updated = await Assignment.findById(assignment._id)
      .populate('course', 'title code department semester')
      .populate('faculty', 'name email profile.avatar');

    return sendSuccess(res, 'Assignment updated successfully', { assignment: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an assignment (Faculty owner / Admin only)
 * @route DELETE /api/assignments/:id
 */
export const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid assignment ID format'));
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return next(ApiError.notFound('Assignment not found'));
    }

    // Ownership check
    if (req.user.role !== 'admin' && !assignment.faculty.equals(req.user._id)) {
      return next(ApiError.forbidden('You do not have permission to delete this assignment'));
    }

    await Promise.all([
      Assignment.findByIdAndDelete(id),
      Submission.deleteMany({ assignment: id }),
    ]);

    return sendSuccess(res, 'Assignment and associated submissions deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
