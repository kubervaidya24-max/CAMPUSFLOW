import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
} from '../src/validators/authValidators.js';
import {
  updateProfileSchema,
} from '../src/validators/userValidators.js';
import {
  createCourseSchema,
  updateCourseSchema,
} from '../src/validators/courseValidators.js';
import {
  createAssignmentSchema,
  gradeSubmissionSchema,
} from '../src/validators/assignmentValidators.js';
import {
  createProjectSchema,
  createTaskSchema,
} from '../src/validators/projectValidators.js';
import {
  createDSAProblemSchema,
  createJobApplicationSchema,
} from '../src/validators/placementValidators.js';
import {
  createResumeSchema,
  updateResumeSchema,
} from '../src/validators/resumeValidators.js';

describe('Unit Tests: Zod Validation Schemas (Level 12)', () => {
  describe('Authentication Validators', () => {
    it('should validate valid student registration payload', () => {
      const payload = {
        name: 'Grace Hopper',
        email: 'grace@campusflow.edu',
        password: 'SecurePassword123!',
        role: 'student',
        department: 'Computer Science',
        semester: 4,
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject registration with invalid email or weak password', () => {
      const invalidEmail = registerSchema.safeParse({
        name: 'Grace',
        email: 'invalid-email-format',
        password: 'Pass1',
      });
      expect(invalidEmail.success).toBe(false);
    });

    it('should validate login payload with email and password', () => {
      const result = loginSchema.safeParse({
        email: 'grace@campusflow.edu',
        password: 'SecurePassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('should validate profile update payload', () => {
      const result = updateProfileSchema.safeParse({
        profile: {
          bio: 'Compiler and distributed systems researcher.',
          skills: ['C++', 'Rust', 'Compilers'],
          socialLinks: {
            github: 'https://github.com/gracehopper',
          },
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Course Validators', () => {
    it('should validate complete course creation schema', () => {
      const payload = {
        title: 'Compiler Design',
        code: 'CS601',
        description: 'Lexical analysis, parsing, and LLVM code generation.',
        department: 'Computer Science',
        semester: 6,
        credits: 4,
        maxCapacity: 60,
      };
      const result = createCourseSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject course creation with invalid credits', () => {
      const result = createCourseSchema.safeParse({
        title: 'Course',
        code: 'CS101',
        description: 'Description here',
        department: 'CS',
        credits: 100, // exceeds max credit limit
      });
      expect(result.success).toBe(false);
    });

    it('should validate partial course update', () => {
      const result = updateCourseSchema.safeParse({
        title: 'Advanced Compiler Optimization',
        status: 'published',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Assignment & Submission Validators', () => {
    it('should validate assignment creation schema', () => {
      const payload = {
        title: 'AST Parser Implementation',
        description: 'Build a recursive descent parser.',
        courseId: '66a123456789012345678901',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        totalPoints: 100,
        allowLate: true,
      };
      const result = createAssignmentSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should validate grade submission schema', () => {
      const payload = {
        score: 95,
        feedback: 'Excellent AST traversal.',
      };
      const result = gradeSubmissionSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('Project & Task Validators', () => {
    it('should validate project creation schema', () => {
      const payload = {
        title: 'Distributed File System',
        description: 'Raft-backed replicated storage.',
        technologies: ['Go', 'Raft', 'gRPC'],
      };
      const result = createProjectSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should validate task creation schema with status and priority', () => {
      const payload = {
        title: 'Implement Write-Ahead Logging',
        description: 'Persist log entries before commit.',
        priority: 'high',
        status: 'TODO',
      };
      const result = createTaskSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('Placement & Career Validators', () => {
    it('should validate DSA problem creation payload', () => {
      const payload = {
        title: 'Course Schedule',
        platform: 'LeetCode',
        topic: 'Graphs',
        difficulty: 'Medium',
        status: 'Solved',
      };
      const result = createDSAProblemSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should validate job application creation payload', () => {
      const payload = {
        company: 'Apple',
        role: 'Systems Software Engineer',
        status: 'APPLIED',
        salary: '$160,000',
      };
      const result = createJobApplicationSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('Resume Builder Validators', () => {
    it('should validate resume creation schema with sections', () => {
      const payload = {
        title: 'Systems Engineer Resume',
        template: 'dual-column',
        personalInfo: {
          fullName: 'Grace Hopper',
          email: 'grace@campusflow.edu',
          phone: '+1 555-0199',
          headline: 'Systems Architect & Compiler Engineer',
        },
        skills: [{ category: 'Languages', items: ['Rust', 'C++', 'Go'] }],
      };
      const result = createResumeSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should validate resume update schema', () => {
      const payload = {
        template: 'modern',
        title: 'Updated Modern Resume',
      };
      const result = updateResumeSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
