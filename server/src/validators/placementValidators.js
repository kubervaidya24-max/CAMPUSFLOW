import { z } from 'zod';
import { DSA_TOPICS, DSA_PLATFORMS } from '../models/DSAProblem.js';
import { JOB_STATUSES } from '../models/JobApplication.js';

export const createDSAProblemSchema = z.object({
  title: z
    .string({ required_error: 'Problem title is required' })
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  platform: z.enum(DSA_PLATFORMS).optional().default('LeetCode'),
  problemUrl: z.string().url('Invalid problem URL format').optional().or(z.literal('')),
  topic: z.enum(DSA_TOPICS, { required_error: 'Valid DSA topic is required' }),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
    required_error: 'Difficulty (Easy, Medium, Hard) is required',
  }),
  status: z.enum(['Todo', 'In Progress', 'Solved', 'Revisit']).optional().default('Todo'),
  solvedDate: z.string().datetime().optional().nullable().or(z.literal('')),
  notes: z.string().max(5000, 'Notes cannot exceed 5000 characters').optional(),
  timeSpentMinutes: z.number().min(0).optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const updateDSAProblemSchema = createDSAProblemSchema.partial();

export const createJobApplicationSchema = z.object({
  company: z
    .string({ required_error: 'Company name is required' })
    .min(1, 'Company name cannot be empty')
    .max(100, 'Company name cannot exceed 100 characters'),
  role: z
    .string({ required_error: 'Job role is required' })
    .min(1, 'Role cannot be empty')
    .max(100, 'Role cannot exceed 100 characters'),
  location: z.string().max(100).optional(),
  jobType: z.enum(['Full-time', 'Internship', 'Contract']).optional().default('Full-time'),
  salary: z.string().max(50).optional(),
  applicationDate: z.string().datetime().optional().nullable().or(z.literal('')),
  status: z.enum(JOB_STATUSES).optional().default('APPLIED'),
  interviewDate: z.string().datetime().optional().nullable().or(z.literal('')),
  jobUrl: z.string().url('Invalid job URL').optional().or(z.literal('')),
  notes: z.string().max(3000, 'Notes cannot exceed 3000 characters').optional(),
  contacts: z
    .array(
      z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        linkedin: z.string().optional(),
      })
    )
    .optional(),
});

export const updateJobApplicationSchema = createJobApplicationSchema.partial();
