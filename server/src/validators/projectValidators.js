import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().trim().min(3, 'Project title must be at least 3 characters').max(120),
  description: z.string().trim().min(5, 'Project description must be at least 5 characters').max(3000),
  technologies: z.array(z.string().trim()).optional().default([]),
  repositoryUrl: z.string().trim().optional().default(''),
  liveUrl: z.string().trim().optional().default(''),
  status: z.enum(['planning', 'active', 'completed', 'archived']).default('active'),
  deadline: z
    .string()
    .or(z.date())
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Deadline must be a valid date format',
    })
    .optional(),
});

export const updateProjectSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().min(5).max(3000).optional(),
    technologies: z.array(z.string().trim()).optional(),
    repositoryUrl: z.string().trim().optional(),
    liveUrl: z.string().trim().optional(),
    status: z.enum(['planning', 'active', 'completed', 'archived']).optional(),
    deadline: z
      .string()
      .or(z.date())
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: 'Deadline must be a valid date format',
      })
      .optional(),
  })
  .strict();

export const inviteMemberSchema = z.object({
  email: z.string().trim().email('Must be a valid email address'),
  role: z.enum(['member', 'lead']).default('member'),
});

export const respondInvitationSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(150),
  description: z.string().trim().max(2000).optional().default(''),
  assigneeId: z.string().trim().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  deadline: z
    .string()
    .or(z.date())
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Deadline must be a valid date format',
    })
    .optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().max(2000).optional(),
    assigneeId: z.string().trim().nullable().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    deadline: z
      .string()
      .or(z.date())
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: 'Deadline must be a valid date format',
      })
      .nullable()
      .optional(),
  })
  .strict();

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});
