import { z } from 'zod';
import { DSA_TOPICS, DSA_PLATFORMS } from '../models/DSAProblem.js';
import { PROGRESS_STATUSES } from '../models/DSASheetProgress.js';

export const updateSheetMetadataSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150, 'Title cannot exceed 150 characters').optional(),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
});

export const togglePublishSheetSchema = z.object({
  isPublished: z.boolean({ required_error: 'isPublished boolean is required' }),
});

export const addQuestionSchema = z.object({
  title: z.string().trim().min(2, 'Question title must be at least 2 characters').max(200, 'Title cannot exceed 200 characters'),
  problemUrl: z.string().trim().url('Must be a valid HTTP or HTTPS problem URL'),
  platform: z.enum(DSA_PLATFORMS).default('LeetCode'),
  topic: z.enum(DSA_TOPICS),
  subTopic: z.string().trim().max(100, 'Subtopic cannot exceed 100 characters').optional().default(''),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  tags: z.array(z.string().trim()).optional().default([]),
  order: z.number().int().optional(),
});

export const updateQuestionSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  problemUrl: z.string().trim().url().optional(),
  platform: z.enum(DSA_PLATFORMS).optional(),
  topic: z.enum(DSA_TOPICS).optional(),
  subTopic: z.string().trim().max(100).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  tags: z.array(z.string().trim()).optional(),
  order: z.number().int().optional(),
});

export const reorderQuestionsSchema = z.object({
  questionIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid question ID format')).min(1, 'At least one question ID required'),
});

export const updateProgressSchema = z.object({
  status: z.enum(PROGRESS_STATUSES, { required_error: 'Status is required (NOT_STARTED, ATTEMPTED, SOLVED)' }),
  notes: z.string().trim().max(5000, 'Notes cannot exceed 5000 characters').optional(),
});
