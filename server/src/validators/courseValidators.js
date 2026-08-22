import { z } from 'zod';

const syllabusItemValidator = z.object({
  week: z.coerce.number().int().min(1).max(52),
  title: z.string().trim().min(1, 'Topic title is required').max(150),
  description: z.string().trim().max(500).optional().default(''),
});

const scheduleValidator = z.object({
  days: z.array(z.string().trim().max(20)).optional().default([]),
  time: z.string().trim().max(100).optional().default(''),
  room: z.string().trim().max(100).optional().default(''),
});

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Code must be at least 2 characters')
    .max(15)
    .regex(/^[A-Z0-9_-]+$/, 'Course code must contain only letters, numbers, hyphens or underscores'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  department: z.string().trim().min(2, 'Department is required').max(100),
  semester: z.coerce.number().int().min(1, 'Semester must be between 1 and 12').max(12),
  credits: z.coerce.number().int().min(1, 'Credits must be at least 1').max(10).default(3),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1').max(500).default(60),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  syllabus: z.array(syllabusItemValidator).optional().default([]),
  schedule: scheduleValidator.optional().default({ days: [], time: '', room: '' }),
});

export const updateCourseSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(2)
      .max(15)
      .regex(/^[A-Z0-9_-]+$/)
      .optional(),
    description: z.string().trim().min(5).max(2000).optional(),
    department: z.string().trim().min(2).max(100).optional(),
    semester: z.coerce.number().int().min(1).max(12).optional(),
    credits: z.coerce.number().int().min(1).max(10).optional(),
    capacity: z.coerce.number().int().min(1).max(500).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    syllabus: z.array(syllabusItemValidator).optional(),
    schedule: scheduleValidator.optional(),
  })
  .strict();
