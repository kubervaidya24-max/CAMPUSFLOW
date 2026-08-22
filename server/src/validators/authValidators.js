import { z } from 'zod';

// Strong password regex: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  role: z
    .enum(['student', 'faculty', 'admin'], {
      errorMap: () => ({ message: "Role must be 'student', 'faculty', or 'admin'" }),
    })
    .optional()
    .default('student'),
  department: z.string().trim().max(100).optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2040).optional(),
  collegeId: z.string().trim().max(50).optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
