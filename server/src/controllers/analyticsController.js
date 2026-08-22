import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { ProjectActivity } from '../models/ProjectActivity.js';
import { DSAProblem } from '../models/DSAProblem.js';
import { JobApplication } from '../models/JobApplication.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Get comprehensive student performance analytics computed from real database data.
 * @route GET /api/analytics/student
 */
export const getStudentAnalytics = async (req, res, next) => {
  try {
    const userObjId = new mongoose.Types.ObjectId(req.user._id);

    // ------------------------------------------------------------------
    // 1. ACADEMIC & COURSE ANALYTICS
    // Aggregation: Match courses where user is in enrolledStudents array.
    // Computes total enrolled courses, total active credits, and department breakdown.
    // ------------------------------------------------------------------
    const courseStats = await Course.aggregate([
      { $match: { 'enrolledStudents.student': userObjId } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                enrolledCount: { $sum: 1 },
                totalCredits: { $sum: '$credits' },
              },
            },
          ],
          departments: [
            {
              $group: {
                _id: '$department',
                count: { $sum: 1 },
                credits: { $sum: '$credits' },
              },
            },
          ],
          enrolledCourseIds: [
            { $project: { _id: 1 } },
          ],
        },
      },
    ]);

    const enrolledCourseIds = (courseStats[0]?.enrolledCourseIds || []).map((c) => c._id);
    const academicSummary = {
      enrolledCourses: courseStats[0]?.summary[0]?.enrolledCount || 0,
      totalCredits: courseStats[0]?.summary[0]?.totalCredits || 0,
      departmentDistribution: courseStats[0]?.departments || [],
    };

    // ------------------------------------------------------------------
    // 2. ASSIGNMENT & SUBMISSION PERFORMANCE
    // Aggregation: Find all published assignments across enrolled courses.
    // Lookup student submissions, compute completion rate, average score %,
    // and on-time vs late ratios.
    // ------------------------------------------------------------------
    const totalAssignmentsCount = await Assignment.countDocuments({
      course: { $in: enrolledCourseIds },
    });

    const submissionStats = await Submission.aggregate([
      { $match: { student: userObjId } },
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignment',
          foreignField: '_id',
          as: 'assignmentDetails',
        },
      },
      { $unwind: '$assignmentDetails' },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalSubmissions: { $sum: 1 },
                gradedSubmissions: {
                  $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] },
                },
                lateSubmissions: {
                  $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] },
                },
                onTimeSubmissions: {
                  $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] },
                },
                totalScoreObtained: {
                  $sum: { $ifNull: ['$grade.score', 0] },
                },
                totalPossibleScore: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', 'graded'] },
                      '$assignmentDetails.totalPoints',
                      0,
                    ],
                  },
                },
              },
            },
          ],
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const subSummary = submissionStats[0]?.summary[0] || {
      totalSubmissions: 0,
      gradedSubmissions: 0,
      lateSubmissions: 0,
      onTimeSubmissions: 0,
      totalScoreObtained: 0,
      totalPossibleScore: 0,
    };

    const assignmentMetrics = {
      totalAssignments: totalAssignmentsCount,
      submittedCount: subSummary.totalSubmissions,
      gradedCount: subSummary.gradedSubmissions,
      onTimeCount: subSummary.onTimeSubmissions,
      lateCount: subSummary.lateSubmissions,
      completionRate:
        totalAssignmentsCount > 0
          ? Math.round((subSummary.totalSubmissions / totalAssignmentsCount) * 100)
          : 0,
      averageGradePercentage:
        subSummary.totalPossibleScore > 0
          ? Math.round((subSummary.totalScoreObtained / subSummary.totalPossibleScore) * 100)
          : 0,
      statusBreakdown: submissionStats[0]?.statusBreakdown || [],
    };

    // ------------------------------------------------------------------
    // 3. PROJECT & TASK COLLABORATION METRICS
    // Aggregation: Find all projects where user is owner or member.
    // Query task assignments: TODO, IN_PROGRESS, DONE.
    // ------------------------------------------------------------------
    const projectStats = await Project.aggregate([
      {
        $match: {
          $or: [{ owner: userObjId }, { 'members.user': userObjId }],
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalProjects: { $sum: 1 },
                ownedProjects: {
                  $sum: { $cond: [{ $eq: ['$owner', userObjId] }, 1, 0] },
                },
                collaboratingProjects: {
                  $sum: { $cond: [{ $ne: ['$owner', userObjId] }, 1, 0] },
                },
              },
            },
          ],
          projectIds: [{ $project: { _id: 1 } }],
        },
      },
    ]);

    const userProjectIds = (projectStats[0]?.projectIds || []).map((p) => p._id);

    const taskStats = await Task.aggregate([
      {
        $match: {
          project: { $in: userProjectIds },
          assignee: userObjId,
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalAssigned: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] },
                },
                inProgress: {
                  $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] },
                },
                todo: {
                  $sum: { $cond: [{ $eq: ['$status', 'TODO'] }, 1, 0] },
                },
              },
            },
          ],
          byPriority: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const taskSum = taskStats[0]?.summary[0] || {
      totalAssigned: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
    };

    const projectMetrics = {
      totalProjects: projectStats[0]?.summary[0]?.totalProjects || 0,
      ownedProjects: projectStats[0]?.summary[0]?.ownedProjects || 0,
      collaboratingProjects: projectStats[0]?.summary[0]?.collaboratingProjects || 0,
      tasks: {
        totalAssigned: taskSum.totalAssigned,
        completed: taskSum.completed,
        inProgress: taskSum.inProgress,
        todo: taskSum.todo,
        completionRate:
          taskSum.totalAssigned > 0
            ? Math.round((taskSum.completed / taskSum.totalAssigned) * 100)
            : 0,
        byPriority: taskStats[0]?.byPriority || [],
      },
    };

    // ------------------------------------------------------------------
    // 4. DSA & PLACEMENT CAREER METRICS
    // Aggregation: Solved problems, topic mastery, and job pipeline status counts.
    // ------------------------------------------------------------------
    const dsaStats = await DSAProblem.aggregate([
      { $match: { user: userObjId } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                solved: {
                  $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] },
                },
                easySolved: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ['$status', 'Solved'] }, { $eq: ['$difficulty', 'Easy'] }] },
                      1,
                      0,
                    ],
                  },
                },
                mediumSolved: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ['$status', 'Solved'] }, { $eq: ['$difficulty', 'Medium'] }] },
                      1,
                      0,
                    ],
                  },
                },
                hardSolved: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ['$status', 'Solved'] }, { $eq: ['$difficulty', 'Hard'] }] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          byTopic: [
            {
              $group: {
                _id: '$topic',
                total: { $sum: 1 },
                solved: {
                  $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
    ]);

    const dsaSum = dsaStats[0]?.summary[0] || {
      total: 0,
      solved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
    };

    const jobStats = await JobApplication.aggregate([
      { $match: { user: userObjId } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', ['APPLIED', 'OA', 'TECHNICAL', 'HR']] },
                      1,
                      0,
                    ],
                  },
                },
                interviews: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', ['TECHNICAL', 'HR']] },
                      1,
                      0,
                    ],
                  },
                },
                offers: {
                  $sum: { $cond: [{ $eq: ['$status', 'OFFER'] }, 1, 0] },
                },
                rejected: {
                  $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] },
                },
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const jobSum = jobStats[0]?.summary[0] || {
      total: 0,
      active: 0,
      interviews: 0,
      offers: 0,
      rejected: 0,
    };

    const careerMetrics = {
      dsa: {
        totalTracked: dsaSum.total,
        solvedCount: dsaSum.solved,
        easySolved: dsaSum.easySolved,
        mediumSolved: dsaSum.mediumSolved,
        hardSolved: dsaSum.hardSolved,
        completionPercentage:
          dsaSum.total > 0 ? Math.round((dsaSum.solved / dsaSum.total) * 100) : 0,
        byTopic: dsaStats[0]?.byTopic || [],
      },
      jobs: {
        totalApplications: jobSum.total,
        activePipeline: jobSum.active,
        interviewCount: jobSum.interviews,
        offersReceived: jobSum.offers,
        rejections: jobSum.rejected,
        rejectionRate:
          jobSum.total > 0 ? Math.round((jobSum.rejected / jobSum.total) * 100) : 0,
        offerConversionRate:
          jobSum.total > 0 ? Math.round((jobSum.offers / jobSum.total) * 100) : 0,
        byStatus: jobStats[0]?.byStatus || [],
      },
    };

    return sendSuccess(res, 'Student analytics calculated successfully', {
      academic: academicSummary,
      assignments: assignmentMetrics,
      projects: projectMetrics,
      career: careerMetrics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project-specific analytics (task completion, member contribution, activity history).
 * @route GET /api/analytics/project/:projectId
 */
export const getProjectAnalytics = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userObjId = new mongoose.Types.ObjectId(req.user._id);

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(ApiError.badRequest('Invalid project ID format'));
    }

    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: userObjId }, { 'members.user': userObjId }],
    }).populate('members.user', 'name email profile.avatar');

    if (!project) {
      return next(ApiError.notFound('Project not found or unauthorized'));
    }

    // 1. Task Breakdown by Status and Priority
    const taskBreakdown = await Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                done: { $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] } },
                inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
                todo: { $sum: { $cond: [{ $eq: ['$status', 'TODO'] }, 1, 0] } },
              },
            },
          ],
          byPriority: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
              },
            },
          ],
          // Member contributions: tasks completed vs total per member
          memberContribution: [
            {
              $group: {
                _id: '$assignee',
                assignedCount: { $sum: 1 },
                completedCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] },
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'assigneeDetails',
              },
            },
            {
              $project: {
                _id: 1,
                assignedCount: 1,
                completedCount: 1,
                name: { $arrayElemAt: ['$assigneeDetails.name', 0] },
                email: { $arrayElemAt: ['$assigneeDetails.email', 0] },
              },
            },
          ],
        },
      },
    ]);

    const taskSum = taskBreakdown[0]?.summary[0] || {
      total: 0,
      done: 0,
      inProgress: 0,
      todo: 0,
    };

    // 2. Recent Project Activities (Audit Stream)
    const recentActivities = await ProjectActivity.find({ project: projectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name profile.avatar');

    return sendSuccess(res, 'Project analytics retrieved successfully', {
      project: {
        _id: project._id,
        title: project.title,
        status: project.status,
        memberCount: project.members.length,
      },
      tasks: {
        total: taskSum.total,
        done: taskSum.done,
        inProgress: taskSum.inProgress,
        todo: taskSum.todo,
        completionRate:
          taskSum.total > 0 ? Math.round((taskSum.done / taskSum.total) * 100) : 0,
        byPriority: taskBreakdown[0]?.byPriority || [],
        memberContribution: taskBreakdown[0]?.memberContribution || [],
      },
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get placement and career funnel analytics.
 * @route GET /api/analytics/placement
 */
export const getPlacementAnalytics = async (req, res, next) => {
  try {
    const userObjId = new mongoose.Types.ObjectId(req.user._id);

    const [jobStats, dsaStats] = await Promise.all([
      JobApplication.aggregate([
        { $match: { user: userObjId } },
        {
          $facet: {
            pipelineStages: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                },
              },
            ],
            summary: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  applied: { $sum: { $cond: [{ $eq: ['$status', 'APPLIED'] }, 1, 0] } },
                  oa: { $sum: { $cond: [{ $eq: ['$status', 'OA'] }, 1, 0] } },
                  technical: { $sum: { $cond: [{ $eq: ['$status', 'TECHNICAL'] }, 1, 0] } },
                  hr: { $sum: { $cond: [{ $eq: ['$status', 'HR'] }, 1, 0] } },
                  offer: { $sum: { $cond: [{ $eq: ['$status', 'OFFER'] }, 1, 0] } },
                  rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } },
                },
              },
            ],
          },
        },
      ]),
      DSAProblem.aggregate([
        { $match: { user: userObjId } },
        {
          $facet: {
            difficultyBreakdown: [
              {
                $group: {
                  _id: '$difficulty',
                  total: { $sum: 1 },
                  solved: { $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] } },
                },
              },
            ],
            topicMastery: [
              {
                $group: {
                  _id: '$topic',
                  total: { $sum: 1 },
                  solved: { $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] } },
                },
              },
            ],
          },
        },
      ]),
    ]);

    const jobSum = jobStats[0]?.summary[0] || {
      total: 0,
      applied: 0,
      oa: 0,
      technical: 0,
      hr: 0,
      offer: 0,
      rejected: 0,
    };

    return sendSuccess(res, 'Placement analytics calculated successfully', {
      funnel: {
        total: jobSum.total,
        applied: jobSum.applied,
        oa: jobSum.oa,
        technical: jobSum.technical,
        hr: jobSum.hr,
        offer: jobSum.offer,
        rejected: jobSum.rejected,
        rejectionRate:
          jobSum.total > 0 ? Math.round((jobSum.rejected / jobSum.total) * 100) : 0,
        interviewRate:
          jobSum.total > 0
            ? Math.round(((jobSum.technical + jobSum.hr + jobSum.offer) / jobSum.total) * 100)
            : 0,
      },
      dsa: {
        difficulty: dsaStats[0]?.difficultyBreakdown || [],
        topics: dsaStats[0]?.topicMastery || [],
      },
    });
  } catch (error) {
    next(error);
  }
};
