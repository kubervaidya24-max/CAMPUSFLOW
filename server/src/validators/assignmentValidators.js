import { z } from 'zod';

const attachmentValidator = z.object({
  name: z.string().trim().min(1).max(150),
  url: z.string().trim().min(1),
  size: z.number().nonnegative().optional().default(0),
});

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(3000),
  courseId: z.string().trim().min(1, 'Course ID is required'),
  dueDate: z.string().or(z.date()).refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Due date must be a valid date/time format',
  }),
  totalPoints: z.coerce.number().int().min(1, 'Total points must be at least 1').max(1000).default(100),
  allowLate: z.boolean().default(true),
  attachments: z.array(attachmentValidator).optional().default([]),
  status: z.enum(['draft', 'published', 'closed']).default('published'),
});

export const updateAssignmentSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().min(5).max(3000).optional(),
    dueDate: z
      .string()
      .or(z.date())
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: 'Due date must be a valid date/time format',
      })
      .optional(),
    totalPoints: z.coerce.number().int().min(1).max(1000).optional(),
    allowLate: z.boolean().optional(),
    attachments: z.array(attachmentValidator).optional(),
    status: z.enum(['draft', 'published', 'closed']).optional(),
  })
  .strict();

export const createSubmissionSchema = z.object({
  content: z.string().trim().min(2, 'Submission notes or project repository URL is required').max(3000),
  attachments: z.array(attachmentValidator).optional().default([]),
});

export const gradeSubmissionSchema = z.object({
  score: z.coerce.number().min(0, 'Score cannot be negative'),
  feedback: z.string().trim().max(1500).optional().default(''),
});
