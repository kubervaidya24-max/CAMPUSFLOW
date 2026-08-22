import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50).optional(),
    profile: z
      .object({
        avatar: z.string().trim().max(1000).optional(),
        bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
        department: z.string().trim().max(100).optional(),
        semester: z.coerce.number().int().min(1, 'Semester must be between 1 and 12').max(12).optional(),
        graduationYear: z.coerce.number().int().min(2000).max(2040).optional(),
        collegeId: z.string().trim().max(50).optional(),
        skills: z.array(z.string().trim().max(50)).max(30).optional(),
        interests: z.array(z.string().trim().max(50)).max(30).optional(),
        socialLinks: z
          .object({
            github: z.string().trim().max(255).optional(),
            linkedin: z.string().trim().max(255).optional(),
            portfolio: z.string().trim().max(255).optional(),
          })
          .optional(),
        designation: z.string().trim().max(100).optional(),
        subjects: z.array(z.string().trim().max(100)).max(30).optional(),
        officeLocation: z.string().trim().max(100).optional(),
      })
      .optional(),
  })
  .strict(); // Strict prevents any unknown or forbidden fields at root (like role, email, password)
