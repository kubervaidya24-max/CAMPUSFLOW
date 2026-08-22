import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Profile & Role-Based Access Subsystem (Level 2)', () => {
  let studentToken;
  let studentUser;
  let facultyToken;
  let facultyUser;

  beforeEach(async () => {
    // Register Student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Elena Gilbert',
      email: 'elena.gilbert@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    studentToken = studentRes.body.data.accessToken;
    studentUser = studentRes.body.data.user;

    // Register Faculty
    const facultyRes = await request(app).post('/api/auth/register').send({
      name: 'Dr. Alaric Saltzman',
      email: 'alaric.faculty@campusflow.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Software Engineering',
    });
    facultyToken = facultyRes.body.data.accessToken;
    facultyUser = facultyRes.body.data.user;
  });

  describe('GET /api/users/me', () => {
    it('should return the authenticated user profile with 200 status', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('elena.gilbert@campusflow.edu');
      expect(response.body.data.user.name).toBe('Elena Gilbert');
      expect(response.body.data.user.role).toBe('student');
    });

    it('should reject unauthenticated profile retrieval with 401 Unauthorized', async () => {
      const response = await request(app).get('/api/users/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update student profile fields (bio, semester, skills, interests, social links)', async () => {
      const updatePayload = {
        name: 'Elena Gilbert-Salvatore',
        profile: {
          bio: 'CS Major passionate about distributed systems and cloud architecture.',
          semester: 5,
          skills: ['React', 'Node.js', 'MongoDB', 'Docker', 'Go'],
          interests: ['Cloud Native', 'Web Development', 'Open Source'],
          socialLinks: {
            github: 'https://github.com/elena-gilbert',
            linkedin: 'https://linkedin.com/in/elena-gilbert',
            portfolio: 'https://elena.dev',
          },
        },
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.user.name).toBe('Elena Gilbert-Salvatore');
      expect(response.body.data.user.profile.bio).toContain('distributed systems');
      expect(response.body.data.user.profile.semester).toBe(5);
      expect(response.body.data.user.profile.skills).toEqual(['React', 'Node.js', 'MongoDB', 'Docker', 'Go']);
      expect(response.body.data.user.profile.socialLinks.github).toBe('https://github.com/elena-gilbert');

      // Verify persistence in MongoDB
      const dbUser = await User.findById(studentUser._id);
      expect(dbUser.profile.semester).toBe(5);
      expect(dbUser.profile.skills).toContain('Go');
    });

    it('should update faculty profile fields (designation, subjects, officeLocation)', async () => {
      const updatePayload = {
        profile: {
          designation: 'Associate Professor',
          subjects: ['Distributed Systems', 'Advanced Database Design', 'Cloud Computing'],
          officeLocation: 'Academic Block 3, Room 402',
          bio: 'Leading research in distributed consensus protocols.',
        },
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.profile.designation).toBe('Associate Professor');
      expect(response.body.data.user.profile.subjects).toContain('Distributed Systems');
      expect(response.body.data.user.profile.officeLocation).toBe('Academic Block 3, Room 402');
    });

    it('should reject or prevent privilege escalation attempts (role tampering)', async () => {
      const tamperPayload = {
        name: 'Elena Hacker',
        role: 'admin', // Tampering attempt
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(tamperPayload);

      // Zod schema is strict(), rejecting unrecognized keys at root level
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      // Verify role did NOT change in database
      const dbUser = await User.findById(studentUser._id);
      expect(dbUser.role).toBe('student');
    });

    it('should reject invalid semester value outside 1-12 (400 Bad Request)', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ profile: { semester: 15 } });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should retrieve the public profile of another user by ID (200 OK)', async () => {
      const response = await request(app)
        .get(`/api/users/${facultyUser._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(facultyUser._id);
      expect(response.body.data.user.name).toBe('Dr. Alaric Saltzman');
      expect(response.body.data.user.role).toBe('faculty');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('refreshTokens');
    });

    it('should return 404 Not Found for non-existent user ObjectId', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });

    it('should return 400 Bad Request for malformed user ID', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id-format')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid user ID format');
    });
  });
});
