import { z } from 'zod';

const educationItemSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  current: z.boolean().optional().default(false),
  grade: z.string().optional().default(''),
  location: z.string().optional().default(''),
});

const projectItemSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  role: z.string().optional().default(''),
  technologies: z.array(z.string()).optional().default([]),
  repositoryUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional().default(''),
  highlights: z.array(z.string()).optional().default([]),
});

const experienceItemSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  location: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  current: z.boolean().optional().default(false),
  description: z.string().optional().default(''),
  highlights: z.array(z.string()).optional().default([]),
});

const certificationItemSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().optional().default(''),
  credentialUrl: z.string().url().optional().or(z.literal('')),
});

const achievementItemSchema = z.object({
  title: z.string().min(1, 'Achievement title is required'),
  description: z.string().optional().default(''),
  date: z.string().optional().default(''),
});

const skillCategorySchema = z.object({
  category: z.string().min(1, 'Skill category name is required'),
  items: z.array(z.string()).optional().default([]),
});

export const createResumeSchema = z.object({
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional().default('Software Engineering Resume'),
  template: z.enum(['modern', 'dual-column']).optional().default('modern'),
  personalInfo: z
    .object({
      fullName: z.string().optional().default(''),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional().default(''),
      location: z.string().optional().default(''),
      headline: z.string().optional().default(''),
      summary: z.string().optional().default(''),
    })
    .optional(),
  education: z.array(educationItemSchema).optional().default([]),
  skills: z.array(skillCategorySchema).optional().default([]),
  projects: z.array(projectItemSchema).optional().default([]),
  experience: z.array(experienceItemSchema).optional().default([]),
  certifications: z.array(certificationItemSchema).optional().default([]),
  achievements: z.array(achievementItemSchema).optional().default([]),
  links: z
    .object({
      github: z.string().optional().default(''),
      linkedin: z.string().optional().default(''),
      portfolio: z.string().optional().default(''),
      leetcode: z.string().optional().default(''),
      other: z.string().optional().default(''),
    })
    .optional(),
});

export const updateResumeSchema = createResumeSchema.partial();
