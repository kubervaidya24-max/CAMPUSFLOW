import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { sanitize } from '../src/middleware/sanitize.js';

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

describe('Security Audit & Defensive Hardening Test Suite (Level 13)', () => {
  let aliceToken;
  let bobToken;
  let bobUser;
  let facultyToken;
  let adminToken;
  let aliceResumeId;
  let aliceJobId;

  it('Setup: Provision Alice (Student), Bob (Student), Dijkstra (Faculty), and Ritchie (Admin)', async () => {
    // Alice
    const aRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Student',
      email: 'alice.sec@campusflow.edu',
      password: 'StrongPassword123!',
      role: 'student',
    });
    expect(aRes.status).toBe(201);
    aliceToken = aRes.body.data.accessToken;

    // Bob
    const bRes = await request(app).post('/api/auth/register').send({
      name: 'Bob Student',
      email: 'bob.sec@campusflow.edu',
      password: 'StrongPassword123!',
      role: 'student',
    });
    expect(bRes.status).toBe(201);
    bobUser = bRes.body.data.user;
    bobToken = bRes.body.data.accessToken;

    // Faculty
    const fRes = await request(app).post('/api/auth/register').send({
      name: 'Prof. Dijkstra',
      email: 'dijkstra.sec@campusflow.edu',
      password: 'StrongPassword123!',
      role: 'faculty',
    });
    expect(fRes.status).toBe(201);
    facultyToken = fRes.body.data.accessToken;

    // Admin
    const admRes = await request(app).post('/api/auth/register').send({
      name: 'Dennis Ritchie',
      email: 'ritchie.sec@campusflow.edu',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    expect(admRes.status).toBe(201);
    adminToken = admRes.body.data.accessToken;
  });

  describe('1. NoSQL Injection Neutralization', () => {
    it('should strip MongoDB operator keys ($gt, $ne, $where) from input payloads', () => {
      const mockReq = {
        body: {
          email: { $gt: '' },
          password: 'Password123!',
          nested: {
            $where: 'sleep(1000)',
            validKey: 'validValue',
          },
        },
        query: {
          'user.id': { $ne: null },
          normalQuery: 'search',
        },
        params: {},
      };

      const mockNext = () => {};
      sanitize(mockReq, {}, mockNext);

      // Verify '$' and '.' keys were stripped
      expect(mockReq.body.email).toEqual({});
      expect(mockReq.body.password).toBe('Password123!');
      expect(mockReq.body.nested.$where).toBeUndefined();
      expect(mockReq.body.nested.validKey).toBe('validValue');
      expect(mockReq.query['user.id']).toBeUndefined();
      expect(mockReq.query.normalQuery).toBe('search');
    });

    it('should reject injection attempt during login with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $gt: '' },
          password: 'StrongPassword123!',
        });
      // Sanitizer neutralizes email to {}, which fails Zod email validation
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Insecure Direct Object Reference (IDOR) & Tenant Isolation', () => {
    it('Alice creates private resume and job application', async () => {
      // Alice Resume
      const rRes = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Alice Confidential Resume',
          template: 'modern',
          personalInfo: { fullName: 'Alice Student', email: 'alice.sec@campusflow.edu' },
        });
      expect(rRes.status).toBe(201);
      aliceResumeId = rRes.body.data.resume._id;

      // Alice Job Application
      const jRes = await request(app)
        .post('/api/placements/jobs')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          company: 'Secret AI Corp',
          role: 'Security Engineer',
          status: 'OFFER',
        });
      expect(jRes.status).toBe(201);
      aliceJobId = jRes.body.data.application._id;
    });

    it('Bob cannot access Alice private resume (404 Not Found / Isolated)', async () => {
      const res = await request(app)
        .get(`/api/resumes/${aliceResumeId}`)
        .set('Authorization', `Bearer ${bobToken}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('Bob cannot update or tamper with Alice private resume', async () => {
      const res = await request(app)
        .patch(`/api/resumes/${aliceResumeId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ title: 'Hacked by Bob' });
      expect(res.status).toBe(404);
    });

    it('Bob cannot delete Alice private resume', async () => {
      const res = await request(app)
        .delete(`/api/resumes/${aliceResumeId}`)
        .set('Authorization', `Bearer ${bobToken}`);
      expect(res.status).toBe(404);
    });

    it('Bob cannot access Alice private job application', async () => {
      const res = await request(app)
        .get(`/api/placements/jobs/${aliceJobId}`)
        .set('Authorization', `Bearer ${bobToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('3. Role Privilege Escalation & Route Protection', () => {
    it('Student Alice cannot create courses (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Hacking 101',
          code: 'SEC101',
          description: 'Unauthorized course.',
          department: 'Computer Science',
          semester: 1,
          credits: 3,
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('Student Alice cannot create assignments (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Fake Exam',
          description: 'Fake description',
          courseId: new mongoose.Types.ObjectId().toString(),
          dueDate: new Date().toISOString(),
        });
      expect(res.status).toBe(403);
    });

    it('Non-admin users are blocked from admin statistics (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${aliceToken}`);
      expect(res.status).toBe(403);
    });

    it('Faculty Dijkstra is blocked from admin user directory (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('4. Suspended Account Real-Time Lockout', () => {
    it('Admin Ritchie suspends Bob account', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${bobUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });
      expect(res.status).toBe(200);
      expect(res.body.data.user.isActive).toBe(false);
    });

    it('Suspended Bob is immediately rejected on subsequent API requests (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${bobToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/suspended/i);
    });

    it('Suspended Bob cannot log in (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'bob.sec@campusflow.edu',
          password: 'StrongPassword123!',
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/suspended/i);
    });
  });

  describe('5. Malformed ObjectIds & Error Normalization', () => {
    it('should return 400 Bad Request on invalid MongoDB ObjectId in URL params', async () => {
      const res = await request(app)
        .get('/api/courses/not-a-valid-24char-objectid')
        .set('Authorization', `Bearer ${aliceToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid/i);
    });
  });

  describe('6. Sensitive Data Exposure Prevention', () => {
    it('should not expose password hash or refresh tokens in GET /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${aliceToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.refreshTokens).toBeUndefined();
    });
  });
});
