import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment.js';
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { notificationService } from '../services/notificationService.js';

/**
 * Submit or update an assignment submission (Student only)
 * @route POST /api/assignments/:id/submit
 */
export const submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid assignment ID format'));
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return next(ApiError.notFound('Assignment not found'));
    }

    if (assignment.status === 'closed') {
      return next(ApiError.badRequest('This assignment is closed for submissions'));
    }

    // Verify student is enrolled in the course
    const course = await Course.findById(assignment.course);
    if (!course) {
      return next(ApiError.notFound('Associated course not found'));
    }

    const isEnrolled = course.enrolledStudents.some((e) =>
      e.student.equals(req.user._id)
    );

    if (!isEnrolled) {
      return next(ApiError.forbidden('You must be enrolled in this course to submit assignments'));
    }

    // Check deadline
    const isPastDeadline = Date.now() > new Date(assignment.dueDate).getTime();
    if (isPastDeadline && !assignment.allowLate) {
      return next(ApiError.badRequest('The deadline has passed and late submissions are not allowed for this assignment'));
    }

    const submissionStatus = isPastDeadline ? 'late' : 'submitted';

    // Find existing submission or create new
    let submission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id,
    });

    if (submission) {
      submission.content = content;
      submission.attachments = attachments || [];
      submission.submittedAt = new Date();
      submission.status = submissionStatus;
      await submission.save();
    } else {
      submission = await Submission.create({
        assignment: assignment._id,
        course: assignment.course,
        student: req.user._id,
        content,
        attachments: attachments || [],
        submittedAt: new Date(),
        status: submissionStatus,
      });
    }

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('assignment', 'title totalPoints dueDate')
      .populate('student', 'name email profile.collegeId');

    return sendSuccess(
      res,
      isPastDeadline ? 'Assignment submitted (Late)' : 'Assignment submitted successfully',
      { submission: populatedSubmission }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all submissions for an assignment (Faculty owner / Admin only)
 * @route GET /api/assignments/:id/submissions
 */
export const getSubmissionsForAssignment = async (req, res, next) => {
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
      return next(ApiError.forbidden('You do not have permission to view submissions for this assignment'));
    }

    const submissions = await Submission.find({ assignment: assignment._id })
      .populate('student', 'name email profile.collegeId profile.department profile.semester profile.avatar')
      .populate('grade.gradedBy', 'name email')
      .sort({ submittedAt: -1 });

    return sendSuccess(res, 'Submissions retrieved successfully', {
      submissions,
      totalSubmissions: submissions.length,
      gradedCount: submissions.filter((s) => s.status === 'graded').length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all submissions made by the current authenticated student
 * @route GET /api/submissions/me
 */
export const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title totalPoints dueDate status')
      .populate('course', 'title code department')
      .sort({ submittedAt: -1 });

    return sendSuccess(res, 'My submissions retrieved successfully', { submissions });
  } catch (error) {
    next(error);
  }
};

/**
 * Grade a student submission (Faculty owner / Admin only)
 * @route PATCH /api/submissions/:id/grade
 */
export const gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid submission ID format'));
    }

    const submission = await Submission.findById(id).populate('assignment');
    if (!submission) {
      return next(ApiError.notFound('Submission not found'));
    }

    // Ownership check
    if (
      req.user.role !== 'admin' &&
      !submission.assignment.faculty.equals(req.user._id)
    ) {
      return next(ApiError.forbidden('You do not have permission to grade this submission'));
    }

    // Validate score bounds
    if (score < 0 || score > submission.assignment.totalPoints) {
      return next(
        ApiError.badRequest(
          `Score must be between 0 and maximum points (${submission.assignment.totalPoints})`
        )
      );
    }

    submission.grade = {
      score,
      feedback: feedback || '',
      gradedAt: new Date(),
      gradedBy: req.user._id,
    };
    submission.status = 'graded';

    await submission.save();

    const populated = await Submission.findById(submission._id)
      .populate('student', 'name email profile.collegeId')
      .populate('assignment', 'title totalPoints dueDate');

    // Notify student about feedback and score
    await notificationService.createNotification({
      recipient: submission.student,
      type: 'faculty_feedback',
      title: 'Assignment Graded',
      message: `Your submission for "${submission.assignment.title}" has been graded: ${score}/${submission.assignment.totalPoints}`,
      relatedResource: {
        kind: 'assignment',
        id: submission.assignment._id,
        url: `/assignments/${submission.assignment._id}`,
      },
    });

    return sendSuccess(res, 'Submission evaluated successfully', { submission: populated });
  } catch (error) {
    next(error);
  }
};
