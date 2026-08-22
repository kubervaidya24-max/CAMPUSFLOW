import mongoose from 'mongoose';
import { DSAProblem, DSA_TOPICS } from '../models/DSAProblem.js';
import { JobApplication, JOB_STATUSES } from '../models/JobApplication.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

// ==========================================
// DSA PROBLEM TRACKER CONTROLLERS
// ==========================================

/**
 * Get all DSA problems for the authenticated user with filters & pagination
 * @route GET /api/placements/dsa
 */
export const getDSAProblems = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const { topic, difficulty, status, platform, search } = req.query;

    const filter = { user: req.user._id };

    if (topic && topic !== 'All') {
      filter.topic = topic;
    }
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (platform && platform !== 'All') {
      filter.platform = platform;
    }
    if (search && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const [problems, total] = await Promise.all([
      DSAProblem.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      DSAProblem.countDocuments(filter),
    ]);

    return sendSuccess(res, 'DSA problems retrieved successfully', {
      problems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new DSA problem tracking entry
 * @route POST /api/placements/dsa
 */
export const createDSAProblem = async (req, res, next) => {
  try {
    const {
      title,
      platform,
      problemUrl,
      topic,
      difficulty,
      status,
      solvedDate,
      notes,
      timeSpentMinutes,
      rating,
    } = req.body;

    const effectiveStatus = status || 'Todo';
    let effectiveSolvedDate = solvedDate ? new Date(solvedDate) : undefined;
    if (effectiveStatus === 'Solved' && !effectiveSolvedDate) {
      effectiveSolvedDate = new Date();
    }

    const problem = await DSAProblem.create({
      user: req.user._id,
      title,
      platform: platform || 'LeetCode',
      problemUrl: problemUrl || '',
      topic,
      difficulty,
      status: effectiveStatus,
      solvedDate: effectiveSolvedDate,
      notes: notes || '',
      timeSpentMinutes: timeSpentMinutes || undefined,
      rating: rating || undefined,
    });

    return sendSuccess(res, 'DSA problem added successfully', { problem }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single DSA problem by ID
 * @route GET /api/placements/dsa/:id
 */
export const getDSAProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid problem ID format'));
    }

    const problem = await DSAProblem.findOne({ _id: id, user: req.user._id });
    if (!problem) {
      return next(ApiError.notFound('Problem not found or unauthorized'));
    }

    return sendSuccess(res, 'Problem retrieved successfully', { problem });
  } catch (error) {
    next(error);
  }
};

/**
 * Update DSA problem entry
 * @route PATCH /api/placements/dsa/:id
 */
export const updateDSAProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid problem ID format'));
    }

    const problem = await DSAProblem.findOne({ _id: id, user: req.user._id });
    if (!problem) {
      return next(ApiError.notFound('Problem not found or unauthorized'));
    }

    const updates = req.body;

    // Handle solvedDate auto-assignment or clear
    if (updates.status) {
      if (updates.status === 'Solved' && !updates.solvedDate && !problem.solvedDate) {
        updates.solvedDate = new Date();
      } else if (updates.status !== 'Solved' && !updates.solvedDate) {
        updates.solvedDate = null;
      }
    }

    Object.assign(problem, updates);
    await problem.save();

    return sendSuccess(res, 'DSA problem updated successfully', { problem });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete DSA problem
 * @route DELETE /api/placements/dsa/:id
 */
export const deleteDSAProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid problem ID format'));
    }

    const problem = await DSAProblem.findOneAndDelete({ _id: id, user: req.user._id });
    if (!problem) {
      return next(ApiError.notFound('Problem not found or unauthorized'));
    }

    return sendSuccess(res, 'Problem deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Dynamic Algorithmic Analytics for DSA Progress (Non-hardcoded)
 * @route GET /api/placements/dsa/analytics
 */
export const getDSAAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Core Summary Metrics
    const [totalProblems, solvedCount] = await Promise.all([
      DSAProblem.countDocuments({ user: userId }),
      DSAProblem.countDocuments({ user: userId, status: 'Solved' }),
    ]);

    const completionPercentage =
      totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    // 2. Breakdown by Difficulty (Easy, Medium, Hard)
    const difficultyAggregation = await DSAProblem.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$difficulty',
          total: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] },
          },
        },
      },
    ]);

    const difficultyMap = {
      Easy: { total: 0, solved: 0, percentage: 0 },
      Medium: { total: 0, solved: 0, percentage: 0 },
      Hard: { total: 0, solved: 0, percentage: 0 },
    };

    difficultyAggregation.forEach((item) => {
      if (difficultyMap[item._id]) {
        difficultyMap[item._id].total = item.total;
        difficultyMap[item._id].solved = item.solved;
        difficultyMap[item._id].percentage =
          item.total > 0 ? Math.round((item.solved / item.total) * 100) : 0;
      }
    });

    // 3. Topic Mastery Breakdown
    const topicAggregation = await DSAProblem.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$topic',
          total: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] },
          },
        },
      },
    ]);

    const topicStatsMap = new Map();
    DSA_TOPICS.forEach((t) => topicStatsMap.set(t, { topic: t, total: 0, solved: 0, percentage: 0 }));

    topicAggregation.forEach((item) => {
      topicStatsMap.set(item._id, {
        topic: item._id,
        total: item.total,
        solved: item.solved,
        percentage: item.total > 0 ? Math.round((item.solved / item.total) * 100) : 0,
      });
    });

    const topicBreakdown = Array.from(topicStatsMap.values());

    // 4. Platform Breakdown
    const platformAggregation = await DSAProblem.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Daily Streak Calculation based on solved dates
    const solvedProblemsDates = await DSAProblem.find({
      user: userId,
      status: 'Solved',
      solvedDate: { $exists: true, $ne: null },
    })
      .select('solvedDate')
      .sort({ solvedDate: -1 });

    const distinctDays = Array.from(
      new Set(
        solvedProblemsDates.map((p) => {
          const d = new Date(p.solvedDate);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate()
          ).padStart(2, '0')}`;
        })
      )
    ).sort((a, b) => (a < b ? 1 : -1));

    let currentStreak = 0;
    let longestStreak = 0;

    if (distinctDays.length > 0) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate()
      ).padStart(2, '0')}`;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(
        yesterday.getMonth() + 1
      ).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const latestDay = distinctDays[0];
      const isStreakActive = latestDay === todayStr || latestDay === yesterdayStr;

      if (isStreakActive) {
        let prevDate = new Date(latestDay);
        currentStreak = 1;

        for (let i = 1; i < distinctDays.length; i++) {
          const currDate = new Date(distinctDays[i]);
          const diffDays = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak += 1;
            prevDate = currDate;
          } else {
            break;
          }
        }
      }

      // Compute longest streak
      let tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < distinctDays.length; i++) {
        const prev = new Date(distinctDays[i - 1]);
        const curr = new Date(distinctDays[i]);
        const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    // 6. Recent Solved
    const recentSolved = await DSAProblem.find({
      user: userId,
      status: 'Solved',
    })
      .sort({ solvedDate: -1, updatedAt: -1 })
      .limit(5);

    return sendSuccess(res, 'DSA analytics computed successfully', {
      summary: {
        totalProblems,
        solvedCount,
        completionPercentage,
        currentStreak,
        longestStreak,
      },
      byDifficulty: difficultyMap,
      byTopic: topicBreakdown,
      byPlatform: platformAggregation,
      recentSolved,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// JOB APPLICATION PIPELINE CONTROLLERS
// ==========================================

/**
 * Get all job applications for user with status filter
 * @route GET /api/placements/jobs
 */
export const getJobApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { company: { $regex: search.trim(), $options: 'i' } },
        { role: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const applications = await JobApplication.find(filter).sort({ applicationDate: -1 });

    return sendSuccess(res, 'Job applications retrieved successfully', { applications });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new job application
 * @route POST /api/placements/jobs
 */
export const createJobApplication = async (req, res, next) => {
  try {
    const {
      company,
      role,
      location,
      jobType,
      salary,
      applicationDate,
      status,
      interviewDate,
      jobUrl,
      notes,
      contacts,
    } = req.body;

    const application = await JobApplication.create({
      user: req.user._id,
      company,
      role,
      location: location || '',
      jobType: jobType || 'Full-time',
      salary: salary || '',
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      status: status || 'APPLIED',
      interviewDate: interviewDate ? new Date(interviewDate) : undefined,
      jobUrl: jobUrl || '',
      notes: notes || '',
      contacts: contacts || [],
    });

    return sendSuccess(res, 'Job application created successfully', { application }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get job application by ID
 * @route GET /api/placements/jobs/:id
 */
export const getJobApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid application ID format'));
    }

    const application = await JobApplication.findOne({ _id: id, user: req.user._id });
    if (!application) {
      return next(ApiError.notFound('Job application not found or unauthorized'));
    }

    return sendSuccess(res, 'Job application retrieved successfully', { application });
  } catch (error) {
    next(error);
  }
};

/**
 * Update job application (e.g. advance stage in pipeline)
 * @route PATCH /api/placements/jobs/:id
 */
export const updateJobApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid application ID format'));
    }

    const application = await JobApplication.findOne({ _id: id, user: req.user._id });
    if (!application) {
      return next(ApiError.notFound('Job application not found or unauthorized'));
    }

    Object.assign(application, req.body);
    await application.save();

    return sendSuccess(res, 'Job application updated successfully', { application });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete job application
 * @route DELETE /api/placements/jobs/:id
 */
export const deleteJobApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(ApiError.badRequest('Invalid application ID format'));
    }

    const application = await JobApplication.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!application) {
      return next(ApiError.notFound('Job application not found or unauthorized'));
    }

    return sendSuccess(res, 'Job application deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Job Application Visual Pipeline Grouped Data
 * @route GET /api/placements/jobs/pipeline
 */
export const getJobPipeline = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const applications = await JobApplication.find({ user: userId }).sort({
      applicationDate: -1,
    });

    const pipeline = {
      APPLIED: [],
      OA: [],
      TECHNICAL: [],
      HR: [],
      OFFER: [],
      REJECTED: [],
    };

    applications.forEach((app) => {
      if (pipeline[app.status]) {
        pipeline[app.status].push(app);
      }
    });

    const summary = {
      total: applications.length,
      active: applications.filter(
        (a) => a.status !== 'REJECTED' && a.status !== 'OFFER'
      ).length,
      offers: pipeline.OFFER.length,
      rejected: pipeline.REJECTED.length,
      interviews: pipeline.TECHNICAL.length + pipeline.HR.length,
    };

    return sendSuccess(res, 'Job application pipeline retrieved successfully', {
      pipeline,
      summary,
      stages: JOB_STATUSES,
    });
  } catch (error) {
    next(error);
  }
};
