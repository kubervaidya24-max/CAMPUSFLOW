import mongoose from 'mongoose';
import { DSASheet } from '../models/DSASheet.js';
import { DSASheetProgress } from '../models/DSASheetProgress.js';
import { DSA_TOPICS } from '../models/DSAProblem.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Helper to ensure the singleton Must-to-Do DSA Sheet exists
 */
export const getOrCreateMustDoSheet = async (adminUserId = null) => {
  let sheet = await DSASheet.findOne({ slug: 'must-to-do' });
  if (!sheet) {
    sheet = await DSASheet.create({
      title: 'Must-to-Do DSA Core Sheet',
      description: 'Curated collection of essential coding interview questions across fundamental data structures and algorithmic paradigms.',
      slug: 'must-to-do',
      isPublished: false,
      createdBy: adminUserId || undefined,
      questions: [],
    });
  }
  return sheet;
};

// ==============================================================================
// AUTHENTICATED USER ENDPOINTS
// ==============================================================================

/**
 * Get the Must-to-Do DSA Sheet for authenticated users with user-specific progress
 * @route GET /api/placements/sheet
 */
export const getPublishedSheet = async (req, res, next) => {
  try {
    const sheet = await getOrCreateMustDoSheet(req.user._id);

    // If sheet is not published and requesting user is not an admin, return graceful draft state
    if (!sheet.isPublished && req.user.role !== 'admin') {
      return sendSuccess(res, 'Must-to-Do DSA Sheet is currently unpublished', {
        isPublished: false,
        sheet: null,
        questions: [],
        stats: {
          totalQuestions: 0,
          solvedCount: 0,
          attemptedCount: 0,
          completionPercentage: 0,
          topicBreakdown: [],
          difficultyBreakdown: { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } },
        },
      });
    }

    const { topic, difficulty, platform, status, search } = req.query;

    // Retrieve all active progress records for the calling user on this sheet
    const userProgressRecords = await DSASheetProgress.find({
      user: req.user._id,
      sheet: sheet._id,
    }).lean();

    const progressMap = new Map();
    userProgressRecords.forEach((p) => {
      progressMap.set(p.questionId.toString(), p);
    });

    // Calculate global sheet stats for this user across ALL sheet questions
    const allQuestions = sheet.questions || [];
    const totalQuestions = allQuestions.length;
    let solvedCount = 0;
    let attemptedCount = 0;

    const topicStatsMap = new Map();
    DSA_TOPICS.forEach((t) => topicStatsMap.set(t, { topic: t, total: 0, solved: 0, percentage: 0 }));

    const difficultyStatsMap = {
      Easy: { total: 0, solved: 0, percentage: 0 },
      Medium: { total: 0, solved: 0, percentage: 0 },
      Hard: { total: 0, solved: 0, percentage: 0 },
    };

    allQuestions.forEach((q) => {
      const qProgress = progressMap.get(q._id.toString());
      const isSolved = qProgress && qProgress.status === 'SOLVED';
      const isAttempted = qProgress && qProgress.status === 'ATTEMPTED';

      if (isSolved) solvedCount++;
      if (isAttempted) attemptedCount++;

      // Topic metrics
      if (topicStatsMap.has(q.topic)) {
        const tStat = topicStatsMap.get(q.topic);
        tStat.total += 1;
        if (isSolved) tStat.solved += 1;
      }

      // Difficulty metrics
      if (difficultyStatsMap[q.difficulty]) {
        difficultyStatsMap[q.difficulty].total += 1;
        if (isSolved) difficultyStatsMap[q.difficulty].solved += 1;
      }
    });

    // Compute percentages
    topicStatsMap.forEach((v) => {
      v.percentage = v.total > 0 ? Math.round((v.solved / v.total) * 100) : 0;
    });
    Object.keys(difficultyStatsMap).forEach((k) => {
      const d = difficultyStatsMap[k];
      d.percentage = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
    });

    const completionPercentage = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

    // Filter and decorate questions for client view
    let decoratedQuestions = allQuestions.map((q) => {
      const p = progressMap.get(q._id.toString());
      return {
        _id: q._id,
        title: q.title,
        problemUrl: q.problemUrl,
        platform: q.platform,
        topic: q.topic,
        subTopic: q.subTopic,
        difficulty: q.difficulty,
        tags: q.tags,
        order: q.order,
        userStatus: p ? p.status : 'NOT_STARTED',
        attemptedAt: p ? p.attemptedAt : null,
        solvedAt: p ? p.solvedAt : null,
        notes: p ? p.notes : '',
      };
    });

    // Apply sorting: order ascending, then createdAt ascending
    decoratedQuestions.sort((a, b) => a.order - b.order);

    // Apply optional query filters
    if (topic && topic !== 'All') {
      decoratedQuestions = decoratedQuestions.filter((q) => q.topic === topic);
    }
    if (difficulty && difficulty !== 'All') {
      decoratedQuestions = decoratedQuestions.filter((q) => q.difficulty === difficulty);
    }
    if (platform && platform !== 'All') {
      decoratedQuestions = decoratedQuestions.filter((q) => q.platform === platform);
    }
    if (status && status !== 'All') {
      decoratedQuestions = decoratedQuestions.filter((q) => q.userStatus === status);
    }
    if (search && search.trim()) {
      const queryLower = search.trim().toLowerCase();
      decoratedQuestions = decoratedQuestions.filter((q) =>
        q.title.toLowerCase().includes(queryLower) ||
        (q.subTopic && q.subTopic.toLowerCase().includes(queryLower)) ||
        q.tags.some((tag) => tag.toLowerCase().includes(queryLower))
      );
    }

    return sendSuccess(res, 'Must-to-Do DSA Sheet retrieved successfully', {
      isPublished: sheet.isPublished,
      sheet: {
        _id: sheet._id,
        title: sheet.title,
        description: sheet.description,
        isPublished: sheet.isPublished,
        totalQuestions,
      },
      questions: decoratedQuestions,
      stats: {
        totalQuestions,
        solvedCount,
        attemptedCount,
        completionPercentage,
        topicBreakdown: Array.from(topicStatsMap.values()).filter((t) => t.total > 0),
        difficultyBreakdown: difficultyStatsMap,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user progress for a specific question on the Must-to-Do Sheet
 * @route PATCH /api/placements/sheet/progress/:questionId
 */
export const updateQuestionProgress = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return next(ApiError.badRequest('Invalid question ID format'));
    }

    const sheet = await getOrCreateMustDoSheet(req.user._id);

    // Verify the question belongs to the sheet
    const targetQuestion = sheet.questions.id(questionId);
    if (!targetQuestion) {
      return next(ApiError.notFound('Question not found in Must-to-Do Sheet'));
    }

    // Lifecycle state machine with sparse persistence:
    // If status is NOT_STARTED -> Delete progress record (sparse default)
    if (status === 'NOT_STARTED') {
      await DSASheetProgress.deleteOne({
        user: req.user._id,
        sheet: sheet._id,
        questionId: targetQuestion._id,
      });

      return sendSuccess(res, 'Progress reset to NOT_STARTED', {
        questionId: targetQuestion._id,
        userStatus: 'NOT_STARTED',
        attemptedAt: null,
        solvedAt: null,
        notes: '',
      });
    }

    // If status is ATTEMPTED or SOLVED -> Upsert record
    const existing = await DSASheetProgress.findOne({
      user: req.user._id,
      sheet: sheet._id,
      questionId: targetQuestion._id,
    });

    let attemptedAt = existing?.attemptedAt || null;
    let solvedAt = existing?.solvedAt || null;

    if (status === 'ATTEMPTED') {
      attemptedAt = attemptedAt || new Date();
      solvedAt = null; // Clear solved date if moved back to Attempted
    } else if (status === 'SOLVED') {
      solvedAt = new Date();
      attemptedAt = attemptedAt || new Date();
    }

    const progress = await DSASheetProgress.findOneAndUpdate(
      {
        user: req.user._id,
        sheet: sheet._id,
        questionId: targetQuestion._id,
      },
      {
        status,
        attemptedAt,
        solvedAt,
        notes: notes !== undefined ? notes : existing?.notes || '',
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return sendSuccess(res, `Progress updated to ${status}`, {
      questionId: targetQuestion._id,
      userStatus: progress.status,
      attemptedAt: progress.attemptedAt,
      solvedAt: progress.solvedAt,
      notes: progress.notes,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// ADMIN MANAGEMENT ENDPOINTS (Guarded by authorize('admin'))
// ==============================================================================

/**
 * Get Admin Sheet Overview with full draft/published question list
 * @route GET /api/admin/dsa-sheet
 */
export const getAdminSheet = async (req, res, next) => {
  try {
    const sheet = await getOrCreateMustDoSheet(req.user._id);
    const sortedQuestions = (sheet.questions || []).sort((a, b) => a.order - b.order);

    return sendSuccess(res, 'Admin Must-to-Do DSA Sheet retrieved', {
      sheet: {
        _id: sheet._id,
        title: sheet.title,
        description: sheet.description,
        slug: sheet.slug,
        isPublished: sheet.isPublished,
        totalQuestions: sheet.questions.length,
        createdAt: sheet.createdAt,
        updatedAt: sheet.updatedAt,
      },
      questions: sortedQuestions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Must-to-Do Sheet Metadata (Title, Description)
 * @route PATCH /api/admin/dsa-sheet
 */
export const updateSheetMetadata = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const sheet = await getOrCreateMustDoSheet(req.user._id);

    if (title !== undefined) sheet.title = title;
    if (description !== undefined) sheet.description = description;

    await sheet.save();

    return sendSuccess(res, 'Sheet metadata updated successfully', {
      sheet: {
        _id: sheet._id,
        title: sheet.title,
        description: sheet.description,
        isPublished: sheet.isPublished,
        totalQuestions: sheet.questions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Publish / Unpublish Status of the Sheet
 * @route PATCH /api/admin/dsa-sheet/publish
 */
export const togglePublishSheet = async (req, res, next) => {
  try {
    const { isPublished } = req.body;
    const sheet = await getOrCreateMustDoSheet(req.user._id);

    sheet.isPublished = Boolean(isPublished);
    await sheet.save();

    return sendSuccess(
      res,
      sheet.isPublished ? 'Must-to-Do DSA Sheet is now Published' : 'Must-to-Do DSA Sheet is now Unpublished (Draft)',
      {
        sheet: {
          _id: sheet._id,
          title: sheet.title,
          isPublished: sheet.isPublished,
          totalQuestions: sheet.questions.length,
        },
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new question to the Must-to-Do Sheet
 * @route POST /api/admin/dsa-sheet/questions
 */
export const addQuestion = async (req, res, next) => {
  try {
    const { title, problemUrl, platform, topic, subTopic, difficulty, tags, order } = req.body;
    const sheet = await getOrCreateMustDoSheet(req.user._id);

    const calculatedOrder =
      order !== undefined ? order : sheet.questions.length > 0 ? sheet.questions.length + 1 : 1;

    const newQuestion = {
      _id: new mongoose.Types.ObjectId(),
      title,
      problemUrl,
      platform: platform || 'LeetCode',
      topic,
      subTopic: subTopic || '',
      difficulty: difficulty || 'Medium',
      tags: tags || [],
      order: calculatedOrder,
    };

    sheet.questions.push(newQuestion);
    await sheet.save();

    const added = sheet.questions.id(newQuestion._id);

    return sendSuccess(res, 'Question added to Must-to-Do Sheet', { question: added }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing question in the Must-to-Do Sheet
 * @route PATCH /api/admin/dsa-sheet/questions/:questionId
 */
export const updateQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { title, problemUrl, platform, topic, subTopic, difficulty, tags, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return next(ApiError.badRequest('Invalid question ID format'));
    }

    const sheet = await getOrCreateMustDoSheet(req.user._id);
    const question = sheet.questions.id(questionId);

    if (!question) {
      return next(ApiError.notFound('Question not found in Must-to-Do Sheet'));
    }

    if (title !== undefined) question.title = title;
    if (problemUrl !== undefined) question.problemUrl = problemUrl;
    if (platform !== undefined) question.platform = platform;
    if (topic !== undefined) question.topic = topic;
    if (subTopic !== undefined) question.subTopic = subTopic;
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (tags !== undefined) question.tags = tags;
    if (order !== undefined) question.order = order;

    await sheet.save();

    return sendSuccess(res, 'Question updated successfully', { question });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a question from the Must-to-Do Sheet and cascade cleanup progress records
 * @route DELETE /api/admin/dsa-sheet/questions/:questionId
 */
export const deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return next(ApiError.badRequest('Invalid question ID format'));
    }

    const sheet = await getOrCreateMustDoSheet(req.user._id);
    const question = sheet.questions.id(questionId);

    if (!question) {
      return next(ApiError.notFound('Question not found in Must-to-Do Sheet'));
    }

    // Remove question subdocument from sheet
    sheet.questions.pull(questionId);
    await sheet.save();

    // Cascade deletion: remove all student progress records for this deleted question
    const deleteResult = await DSASheetProgress.deleteMany({
      sheet: sheet._id,
      questionId: new mongoose.Types.ObjectId(questionId),
    });

    return sendSuccess(res, 'Question removed from Must-to-Do Sheet', {
      deletedQuestionId: questionId,
      cleanedProgressRecords: deleteResult.deletedCount,
      totalQuestionsRemaining: sheet.questions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder questions in bulk
 * @route PATCH /api/admin/dsa-sheet/questions/reorder
 */
export const reorderQuestions = async (req, res, next) => {
  try {
    const { questionIds } = req.body;
    const sheet = await getOrCreateMustDoSheet(req.user._id);

    const questionMap = new Map();
    sheet.questions.forEach((q) => questionMap.set(q._id.toString(), q));

    const reorderedQuestions = [];
    questionIds.forEach((id, index) => {
      if (questionMap.has(id)) {
        const q = questionMap.get(id);
        q.order = index + 1;
        reorderedQuestions.push(q);
        questionMap.delete(id);
      }
    });

    // Append any remaining questions
    questionMap.forEach((q) => {
      q.order = reorderedQuestions.length + 1;
      reorderedQuestions.push(q);
    });

    sheet.questions = reorderedQuestions;
    await sheet.save();

    return sendSuccess(res, 'Questions reordered successfully', {
      totalQuestions: sheet.questions.length,
    });
  } catch (error) {
    next(error);
  }
};
