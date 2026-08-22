import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { DSASheet } from '../src/models/DSASheet.js';
import { DSASheetProgress } from '../src/models/DSASheetProgress.js';

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

describe('Admin-Managed Must-to-Do DSA Sheet Subsystem (Level 16)', () => {
  let adminToken;
  let studentAToken;
  let studentBToken;
  let twoSumId;
  let threeSumId;
  let mergeIntervalsId;

  it('Setup: Provision Admin, Student A, and Student B accounts', async () => {
    // Admin
    const admRes = await request(app).post('/api/auth/register').send({
      name: 'Admin Curator',
      email: 'admin.dsa@campusflow.edu',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    expect(admRes.status).toBe(201);
    adminToken = admRes.body.data.accessToken;

    // Student A
    const aRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Algorithmic',
      email: 'alice.dsa@campusflow.edu',
      password: 'StudentPassword123!',
      role: 'student',
    });
    expect(aRes.status).toBe(201);
    studentAToken = aRes.body.data.accessToken;

    // Student B
    const bRes = await request(app).post('/api/auth/register').send({
      name: 'Bob Binary',
      email: 'bob.dsa@campusflow.edu',
      password: 'StudentPassword123!',
      role: 'student',
    });
    expect(bRes.status).toBe(201);
    studentBToken = bRes.body.data.accessToken;
  });

  describe('1. Admin Singleton Sheet Operations & Question Management', () => {
    it('Admin retrieves or initializes the singleton Must-to-Do Sheet (GET /api/admin/dsa-sheet)', async () => {
      const res = await request(app)
        .get('/api/admin/dsa-sheet')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sheet.slug).toBe('must-to-do');
      expect(res.body.data.sheet.isPublished).toBe(false);
      expect(res.body.data.questions).toEqual([]);
    });

    it('Admin updates sheet title and description (PATCH /api/admin/dsa-sheet)', async () => {
      const res = await request(app)
        .patch('/api/admin/dsa-sheet')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'CampusFlow Must-to-Do 150 Core DSA Sheet',
          description: 'Curated industry-standard coding interview problems.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.sheet.title).toBe('CampusFlow Must-to-Do 150 Core DSA Sheet');
    });

    it('Admin adds questions to the sheet (POST /api/admin/dsa-sheet/questions)', async () => {
      // Question 1: Two Sum
      const q1Res = await request(app)
        .post('/api/admin/dsa-sheet/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Two Sum',
          problemUrl: 'https://leetcode.com/problems/two-sum/',
          platform: 'LeetCode',
          topic: 'Arrays',
          subTopic: 'Hash Map Lookup',
          difficulty: 'Easy',
          tags: ['Array', 'Hash Table'],
          order: 1,
        });
      expect(q1Res.status).toBe(201);
      twoSumId = q1Res.body.data.question._id;

      // Question 2: 3Sum
      const q2Res = await request(app)
        .post('/api/admin/dsa-sheet/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '3Sum',
          problemUrl: 'https://leetcode.com/problems/3sum/',
          platform: 'LeetCode',
          topic: 'Arrays',
          subTopic: 'Two Pointers',
          difficulty: 'Medium',
          tags: ['Array', 'Two Pointers', 'Sorting'],
          order: 2,
        });
      expect(q2Res.status).toBe(201);
      threeSumId = q2Res.body.data.question._id;

      // Question 3: Merge Intervals
      const q3Res = await request(app)
        .post('/api/admin/dsa-sheet/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Merge Intervals',
          problemUrl: 'https://leetcode.com/problems/merge-intervals/',
          platform: 'LeetCode',
          topic: 'Arrays',
          subTopic: 'Interval Scheduling',
          difficulty: 'Medium',
          tags: ['Array', 'Sorting'],
          order: 3,
        });
      expect(q3Res.status).toBe(201);
      mergeIntervalsId = q3Res.body.data.question._id;
    });

    it('Admin updates an existing question (PATCH /api/admin/dsa-sheet/questions/:id)', async () => {
      const res = await request(app)
        .patch(`/api/admin/dsa-sheet/questions/${threeSumId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          difficulty: 'Medium',
          tags: ['Array', 'Two Pointers', 'Sorting', 'Amazon Favorite'],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.question.tags).toContain('Amazon Favorite');
    });

    it('Admin reorders questions (PATCH /api/admin/dsa-sheet/questions/reorder)', async () => {
      const res = await request(app)
        .patch('/api/admin/dsa-sheet/questions/reorder')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          questionIds: [threeSumId, twoSumId, mergeIntervalsId],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.totalQuestions).toBe(3);
    });
  });

  describe('2. Server-Side RBAC & Route Authorization Guards', () => {
    it('Student cannot add questions to the sheet (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/admin/dsa-sheet/questions')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({
          title: 'Unauthorized Question',
          problemUrl: 'https://leetcode.com/problems/test/',
          topic: 'Arrays',
          difficulty: 'Easy',
        });

      expect(res.status).toBe(403);
    });

    it('Student cannot publish the sheet (403 Forbidden)', async () => {
      const res = await request(app)
        .patch('/api/admin/dsa-sheet/publish')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({ isPublished: true });

      expect(res.status).toBe(403);
    });

    it('Student cannot delete questions from the sheet (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/admin/dsa-sheet/questions/${twoSumId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('3. Publishing Flow & Authenticated User Visibility', () => {
    it('Student sees unpublished draft state when isPublished is false', async () => {
      const res = await request(app)
        .get('/api/placements/sheet')
        .set('Authorization', `Bearer ${studentAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
      expect(res.body.data.questions).toEqual([]);
    });

    it('Admin publishes the Must-to-Do DSA Sheet', async () => {
      const res = await request(app)
        .patch('/api/admin/dsa-sheet/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: true });

      expect(res.status).toBe(200);
      expect(res.body.data.sheet.isPublished).toBe(true);
    });

    it('Student can now access published sheet and all questions with default NOT_STARTED status', async () => {
      const res = await request(app)
        .get('/api/placements/sheet')
        .set('Authorization', `Bearer ${studentAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(true);
      expect(res.body.data.questions.length).toBe(3);
      expect(res.body.data.stats.totalQuestions).toBe(3);
      expect(res.body.data.stats.solvedCount).toBe(0);
      expect(res.body.data.stats.completionPercentage).toBe(0);

      // Verify all questions default to NOT_STARTED for Student A
      res.body.data.questions.forEach((q) => {
        expect(q.userStatus).toBe('NOT_STARTED');
      });
    });
  });

  describe('4. MANDATORY Multi-User Progress Isolation & State Machine', () => {
    it('Student A marks "Two Sum" as SOLVED', async () => {
      const res = await request(app)
        .patch(`/api/placements/sheet/progress/${twoSumId}`)
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({
          status: 'SOLVED',
          notes: 'Used one-pass hash map approach in O(n) time.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.userStatus).toBe('SOLVED');
      expect(res.body.data.solvedAt).toBeDefined();
    });

    it('Student A sees updated progress (1/3 solved • 33%) and Two Sum = SOLVED', async () => {
      const res = await request(app)
        .get('/api/placements/sheet')
        .set('Authorization', `Bearer ${studentAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stats.solvedCount).toBe(1);
      expect(res.body.data.stats.completionPercentage).toBe(33);

      const twoSumQ = res.body.data.questions.find((q) => q._id === twoSumId);
      expect(twoSumQ.userStatus).toBe('SOLVED');
      expect(twoSumQ.solvedAt).toBeDefined();
    });

    it('CRITICAL: Student B still sees "Two Sum" as NOT_STARTED (0/3 solved • 0%)', async () => {
      const res = await request(app)
        .get('/api/placements/sheet')
        .set('Authorization', `Bearer ${studentBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stats.solvedCount).toBe(0);
      expect(res.body.data.stats.completionPercentage).toBe(0);

      const twoSumQ = res.body.data.questions.find((q) => q._id === twoSumId);
      expect(twoSumQ.userStatus).toBe('NOT_STARTED');
      expect(twoSumQ.solvedAt).toBeNull();
    });

    it('CRITICAL: Verify shared question in DSASheet model contains NO user state', async () => {
      const sheet = await DSASheet.findOne({ slug: 'must-to-do' });
      const rawQuestion = sheet.questions.id(twoSumId).toObject();

      expect(rawQuestion.userStatus).toBeUndefined();
      expect(rawQuestion.isSolved).toBeUndefined();
      expect(rawQuestion.status).toBeUndefined();
    });

    it('Student B marks "Two Sum" as ATTEMPTED', async () => {
      const res = await request(app)
        .patch(`/api/placements/sheet/progress/${twoSumId}`)
        .set('Authorization', `Bearer ${studentBToken}`)
        .send({
          status: 'ATTEMPTED',
          notes: 'Wrote brute force O(n^2), need to optimize.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.userStatus).toBe('ATTEMPTED');
      expect(res.body.data.attemptedAt).toBeDefined();
      expect(res.body.data.solvedAt).toBeNull();
    });

    it('Verify final isolated states: Student A is SOLVED, Student B is ATTEMPTED', async () => {
      // Check Student A
      const aRes = await request(app)
        .get('/api/placements/sheet')
        .set('Authorization', `Bearer ${studentAToken}`);
      const aTwoSum = aRes.body.data.questions.find((q) => q._id === twoSumId);
      expect(aTwoSum.userStatus).toBe('SOLVED');

      // Check Student B
      const bRes = await request(app)
        .get('/api/placements/sheet')
        .set('Authorization', `Bearer ${studentBToken}`);
      const bTwoSum = bRes.body.data.questions.find((q) => q._id === twoSumId);
      expect(bTwoSum.userStatus).toBe('ATTEMPTED');
    });

    it('Sparse Persistence: Changing status to NOT_STARTED deletes the progress record', async () => {
      const resetRes = await request(app)
        .patch(`/api/placements/sheet/progress/${twoSumId}`)
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({ status: 'NOT_STARTED' });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.data.userStatus).toBe('NOT_STARTED');

      // Verify no document exists in DSASheetProgress for Student A and twoSumId
      const record = await DSASheetProgress.findOne({ questionId: twoSumId });
      // Only Student B's record should exist
      expect(record.status).toBe('ATTEMPTED');
    });
  });

  describe('5. Admin Question Deletion & Cascade Progress Cleanup', () => {
    it('Student B solves Merge Intervals before deletion', async () => {
      await request(app)
        .patch(`/api/placements/sheet/progress/${mergeIntervalsId}`)
        .set('Authorization', `Bearer ${studentBToken}`)
        .send({ status: 'SOLVED' });

      const progressCount = await DSASheetProgress.countDocuments({ questionId: mergeIntervalsId });
      expect(progressCount).toBe(1);
    });

    it('Admin deletes Merge Intervals from sheet and cascades progress cleanup', async () => {
      const res = await request(app)
        .delete(`/api/admin/dsa-sheet/questions/${mergeIntervalsId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.cleanedProgressRecords).toBe(1);
      expect(res.body.data.totalQuestionsRemaining).toBe(2);

      // Verify progress record in MongoDB was deleted
      const remainingProgress = await DSASheetProgress.countDocuments({ questionId: mergeIntervalsId });
      expect(remainingProgress).toBe(0);
    });
  });
});
