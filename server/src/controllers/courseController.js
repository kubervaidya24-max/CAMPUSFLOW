import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Create a new course (Faculty / Admin only)
 * @route POST /api/courses
 */
export const createCourse = async (req, res, next) => {
  try {
    const { title, code, description, department, semester, credits, capacity, status, syllabus, schedule } = req.body;

    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return next(ApiError.conflict(`A course with code '${code.toUpperCase()}' already exists`));
    }

    const course = await Course.create({
      title,
      code: code.toUpperCase(),
      description,
      department,
      semester,
      credits: credits || 3,
      capacity: capacity || 60,
      status: status || 'draft',
      faculty: req.user._id,
      syllabus: syllabus || [],
      schedule: schedule || { days: [], time: '', room: '' },
    });

    const populatedCourse = await Course.findById(course._id).populate(
      'faculty',
      'name email profile.avatar profile.department profile.designation'
    );

    return sendSuccess(res, 'Course created successfully', { course: populatedCourse }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * List all courses with filtering & pagination
 * @route GET /api/courses
 */
export const getCourses = async (req, res, next) => {
  try {
    const {
      department,
      semester,
      status,
      search,
      enrolled,
      facultyOnly,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // 1. Department & Semester filters
    if (department) {
      query.department = department;
    }
    if (semester) {
      query.semester = Number(semester);
    }

    // 2. Role-aware status filtering
    if (req.user.role === 'student') {
      if (enrolled === 'true') {
        query['enrolledStudents.student'] = req.user._id;
      } else {
        query.status = 'published';
      }
    } else if (req.user.role === 'faculty') {
      if (facultyOnly === 'true') {
        query.faculty = req.user._id;
      } else if (status) {
        query.status = status;
      } else {
        // By default, faculty sees published courses OR courses they own
        query.$or = [{ status: 'published' }, { faculty: req.user._id }];
      }
    } else if (status) {
      query.status = status;
    }

    // 3. Search filter
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ title: searchRegex }, { code: searchRegex }, { description: searchRegex }],
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('faculty', 'name email profile.avatar profile.department profile.designation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Course.countDocuments(query),
    ]);

    return sendSuccess(res, 'Courses retrieved successfully', {
      courses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed course by ID
 * @route GET /api/courses/:id
 */
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid course ID format'));
    }

    const course = await Course.findById(id)
      .populate('faculty', 'name email profile.avatar profile.department profile.designation profile.officeLocation')
      .populate('enrolledStudents.student', 'name email role profile.avatar profile.department profile.collegeId profile.semester');

    if (!course) {
      return next(ApiError.notFound('Course not found'));
    }

    // Check visibility for draft courses
    if (
      course.status === 'draft' &&
      req.user.role !== 'admin' &&
      !course.faculty._id.equals(req.user._id)
    ) {
      return next(ApiError.forbidden('You do not have permission to view this unpublished course'));
    }

    const isEnrolled = course.enrolledStudents.some((e) =>
      e.student._id ? e.student._id.equals(req.user._id) : e.student.equals(req.user._id)
    );

    return sendSuccess(res, 'Course retrieved successfully', {
      course,
      isEnrolled,
      isOwner: course.faculty._id.equals(req.user._id),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update course details (Owner Faculty / Admin only)
 * @route PATCH /api/courses/:id
 */
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid course ID format'));
    }

    const course = await Course.findById(id);
    if (!course) {
      return next(ApiError.notFound('Course not found'));
    }

    // Ownership check
    if (req.user.role !== 'admin' && !course.faculty.equals(req.user._id)) {
      return next(ApiError.forbidden('You do not have permission to modify this course'));
    }

    // If code is being updated, check uniqueness
    if (req.body.code && req.body.code.toUpperCase() !== course.code) {
      const codeExists = await Course.findOne({
        code: req.body.code.toUpperCase(),
        _id: { $ne: course._id },
      });
      if (codeExists) {
        return next(ApiError.conflict(`A course with code '${req.body.code.toUpperCase()}' already exists`));
      }
      course.code = req.body.code.toUpperCase();
    }

    const allowedFields = [
      'title',
      'description',
      'department',
      'semester',
      'credits',
      'capacity',
      'status',
      'syllabus',
      'schedule',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();

    const updated = await Course.findById(course._id).populate(
      'faculty',
      'name email profile.avatar profile.department profile.designation'
    );

    return sendSuccess(res, 'Course updated successfully', { course: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete / archive course (Owner Faculty / Admin only)
 * @route DELETE /api/courses/:id
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid course ID format'));
    }

    const course = await Course.findById(id);
    if (!course) {
      return next(ApiError.notFound('Course not found'));
    }

    // Ownership check
    if (req.user.role !== 'admin' && !course.faculty.equals(req.user._id)) {
      return next(ApiError.forbidden('You do not have permission to delete this course'));
    }

    await Course.findByIdAndDelete(id);

    return sendSuccess(res, 'Course deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Enroll student in a published course (Student only)
 * @route POST /api/courses/:id/enroll
 */
export const enrollInCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid course ID format'));
    }

    const course = await Course.findById(id);
    if (!course) {
      return next(ApiError.notFound('Course not found'));
    }

    if (course.status !== 'published') {
      return next(ApiError.badRequest('Cannot enroll in a course that is not actively published'));
    }

    // Check duplicate enrollment
    const alreadyEnrolled = course.enrolledStudents.some((e) =>
      e.student.equals(req.user._id)
    );
    if (alreadyEnrolled) {
      return next(ApiError.conflict('You are already enrolled in this course'));
    }

    // Check capacity
    if (course.enrolledStudents.length >= course.capacity) {
      return next(ApiError.badRequest(`Course capacity limit reached (${course.capacity} students max)`));
    }

    course.enrolledStudents.push({
      student: req.user._id,
      enrolledAt: new Date(),
    });

    await course.save();

    return sendSuccess(res, 'Successfully enrolled in course', {
      courseId: course._id,
      enrolledCount: course.enrolledStudents.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unenroll student from a course (Student only)
 * @route DELETE /api/courses/:id/enroll
 */
export const unenrollFromCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid course ID format'));
    }

    const course = await Course.findById(id);
    if (!course) {
      return next(ApiError.notFound('Course not found'));
    }

    const enrolledIndex = course.enrolledStudents.findIndex((e) =>
      e.student.equals(req.user._id)
    );

    if (enrolledIndex === -1) {
      return next(ApiError.badRequest('You are not enrolled in this course'));
    }

    course.enrolledStudents.splice(enrolledIndex, 1);
    await course.save();

    return sendSuccess(res, 'Successfully unenrolled from course', {
      courseId: course._id,
      enrolledCount: course.enrolledStudents.length,
    });
  } catch (error) {
    next(error);
  }
};
