import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { DSAProblem } from '../src/models/DSAProblem.js';
import { JobApplication } from '../src/models/JobApplication.js';

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
  await DSAProblem.deleteMany({});
  await JobApplication.deleteMany({});
});

describe('Placement Preparation & Job Application Pipeline (Level 8)', () => {
  let aliceToken;
  let aliceUser;
  let bobToken;

  beforeEach(async () => {
    // 1. Register Alice (Student)
    const aRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Turing',
      email: 'alice@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    aliceToken = aRes.body.data.accessToken;
    aliceUser = aRes.body.data.user;

    // 2. Register Bob (Student)
    const bRes = await request(app).post('/api/auth/register').send({
      name: 'Bob Lovelace',
      email: 'bob@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Information Science',
    });
    bobToken = bRes.body.data.accessToken;
  });

  describe('DSA Problem Tracking Subsystem', () => {
    it('should allow user to create a new DSA problem entry (201 Created)', async () => {
      const res = await request(app)
        .post('/api/placements/dsa')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Two Sum',
          platform: 'LeetCode',
          problemUrl: 'https://leetcode.com/problems/two-sum/',
          topic: 'Arrays',
          difficulty: 'Easy',
          status: 'Solved',
          notes: 'Used hash map for O(n) time complexity.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.problem.title).toBe('Two Sum');
      expect(res.body.data.problem.topic).toBe('Arrays');
      expect(res.body.data.problem.difficulty).toBe('Easy');
      expect(res.body.data.problem.status).toBe('Solved');
      expect(res.body.data.problem.solvedDate).toBeDefined();
    });

    it('should retrieve filtered DSA problems by topic, difficulty, and status', async () => {
      // Seed problems for Alice
      await DSAProblem.create([
        {
          user: aliceUser._id,
          title: 'LRU Cache',
          topic: 'Linked Lists',
          difficulty: 'Medium',
          status: 'Solved',
          platform: 'LeetCode',
        },
        {
          user: aliceUser._id,
          title: 'Trapping Rain Water',
          topic: 'Arrays',
          difficulty: 'Hard',
          status: 'Todo',
          platform: 'LeetCode',
        },
        {
          user: aliceUser._id,
          title: 'Binary Tree Level Order Traversal',
          topic: 'Trees',
          difficulty: 'Medium',
          status: 'Solved',
          platform: 'LeetCode',
        },
      ]);

      // Query topic=Arrays
      const arrRes = await request(app)
        .get('/api/placements/dsa?topic=Arrays')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(arrRes.status).toBe(200);
      expect(arrRes.body.data.problems).toHaveLength(1);
      expect(arrRes.body.data.problems[0].title).toBe('Trapping Rain Water');

      // Query status=Solved
      const solvedRes = await request(app)
        .get('/api/placements/dsa?status=Solved')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(solvedRes.status).toBe(200);
      expect(solvedRes.body.data.problems).toHaveLength(2);
    });

    it('should update DSA problem status and notes (PATCH /api/placements/dsa/:id)', async () => {
      const problem = await DSAProblem.create({
        user: aliceUser._id,
        title: 'Word Break',
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        status: 'Todo',
      });

      const res = await request(app)
        .patch(`/api/placements/dsa/${problem._id}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          status: 'Solved',
          notes: 'Bottom-up DP table approach.',
          rating: 4,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.problem.status).toBe('Solved');
      expect(res.body.data.problem.solvedDate).toBeDefined();
      expect(res.body.data.problem.rating).toBe(4);
    });

    it('should delete DSA problem entry (DELETE /api/placements/dsa/:id)', async () => {
      const problem = await DSAProblem.create({
        user: aliceUser._id,
        title: 'Merge K Sorted Lists',
        topic: 'Heaps & HashMaps',
        difficulty: 'Hard',
      });

      const res = await request(app)
        .delete(`/api/placements/dsa/${problem._id}`)
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);

      const check = await DSAProblem.findById(problem._id);
      expect(check).toBeNull();
    });

    it('should isolate user DSA problems (Bob cannot access Alice problem)', async () => {
      const problem = await DSAProblem.create({
        user: aliceUser._id,
        title: 'Reverse Nodes in k-Group',
        topic: 'Linked Lists',
        difficulty: 'Hard',
      });

      const res = await request(app)
        .get(`/api/placements/dsa/${problem._id}`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Dynamic Algorithmic Analytics Engine (GET /api/placements/dsa/analytics)', () => {
    it('should dynamically calculate non-hardcoded metrics, topic mastery, and daily streak', async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Seed Alice's problems
      await DSAProblem.create([
        {
          user: aliceUser._id,
          title: 'Two Sum',
          topic: 'Arrays',
          difficulty: 'Easy',
          status: 'Solved',
          solvedDate: today,
        },
        {
          user: aliceUser._id,
          title: '3Sum',
          topic: 'Arrays',
          difficulty: 'Medium',
          status: 'Solved',
          solvedDate: yesterday,
        },
        {
          user: aliceUser._id,
          title: '4Sum',
          topic: 'Arrays',
          difficulty: 'Medium',
          status: 'Todo',
        },
        {
          user: aliceUser._id,
          title: 'Alien Dictionary',
          topic: 'Graphs',
          difficulty: 'Hard',
          status: 'Solved',
          solvedDate: today,
        },
      ]);

      const res = await request(app)
        .get('/api/placements/dsa/analytics')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      const { summary, byDifficulty, byTopic } = res.body.data;

      // Summary checks
      expect(summary.totalProblems).toBe(4);
      expect(summary.solvedCount).toBe(3);
      expect(summary.completionPercentage).toBe(75);
      expect(summary.currentStreak).toBe(2); // today + yesterday

      // Difficulty breakdown
      expect(byDifficulty.Easy.total).toBe(1);
      expect(byDifficulty.Easy.solved).toBe(1);
      expect(byDifficulty.Medium.total).toBe(2);
      expect(byDifficulty.Medium.solved).toBe(1);
      expect(byDifficulty.Hard.total).toBe(1);
      expect(byDifficulty.Hard.solved).toBe(1);

      // Topic mastery
      const arrayTopic = byTopic.find((t) => t.topic === 'Arrays');
      expect(arrayTopic.total).toBe(3);
      expect(arrayTopic.solved).toBe(2);
      expect(arrayTopic.percentage).toBe(67);

      const graphTopic = byTopic.find((t) => t.topic === 'Graphs');
      expect(graphTopic.total).toBe(1);
      expect(graphTopic.solved).toBe(1);
      expect(graphTopic.percentage).toBe(100);
    });
  });

  describe('Job Application Pipeline Subsystem', () => {
    it('should create a new job application in APPLIED stage (201 Created)', async () => {
      const res = await request(app)
        .post('/api/placements/jobs')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          company: 'Google',
          role: 'Software Engineer (L3)',
          location: 'Bangalore, India',
          jobType: 'Full-time',
          salary: '32 LPA',
          status: 'APPLIED',
          jobUrl: 'https://careers.google.com/jobs/123',
          notes: 'Applied via employee referral.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.application.company).toBe('Google');
      expect(res.body.data.application.status).toBe('APPLIED');
    });

    it('should progress job application through visual pipeline stages (APPLIED -> OA -> TECHNICAL -> OFFER)', async () => {
      const appDoc = await JobApplication.create({
        user: aliceUser._id,
        company: 'Microsoft',
        role: 'SWE 1',
        status: 'APPLIED',
      });

      // 1. Advance to OA
      let res = await request(app)
        .patch(`/api/placements/jobs/${appDoc._id}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ status: 'OA' });
      expect(res.body.data.application.status).toBe('OA');

      // 2. Advance to TECHNICAL
      res = await request(app)
        .patch(`/api/placements/jobs/${appDoc._id}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          status: 'TECHNICAL',
          interviewDate: new Date('2026-09-15T10:00:00Z').toISOString(),
        });
      expect(res.body.data.application.status).toBe('TECHNICAL');
      expect(res.body.data.application.interviewDate).toBeDefined();

      // 3. Advance to OFFER
      res = await request(app)
        .patch(`/api/placements/jobs/${appDoc._id}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ status: 'OFFER', salary: '28 LPA' });
      expect(res.body.data.application.status).toBe('OFFER');
    });

    it('should retrieve grouped visual pipeline data (GET /api/placements/jobs/pipeline)', async () => {
      await JobApplication.create([
        { user: aliceUser._id, company: 'Amazon', role: 'SDE-1', status: 'OA' },
        { user: aliceUser._id, company: 'Uber', role: 'Software Engineer', status: 'TECHNICAL' },
        { user: aliceUser._id, company: 'Stripe', role: 'Backend Engineer', status: 'OFFER' },
        { user: aliceUser._id, company: 'Meta', role: 'Production Engineer', status: 'REJECTED' },
      ]);

      const res = await request(app)
        .get('/api/placements/jobs/pipeline')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      const { pipeline, summary } = res.body.data;

      expect(pipeline.OA).toHaveLength(1);
      expect(pipeline.OA[0].company).toBe('Amazon');
      expect(pipeline.TECHNICAL).toHaveLength(1);
      expect(pipeline.TECHNICAL[0].company).toBe('Uber');
      expect(pipeline.OFFER).toHaveLength(1);
      expect(pipeline.OFFER[0].company).toBe('Stripe');
      expect(pipeline.REJECTED).toHaveLength(1);
      expect(pipeline.REJECTED[0].company).toBe('Meta');

      expect(summary.total).toBe(4);
      expect(summary.offers).toBe(1);
      expect(summary.rejected).toBe(1);
      expect(summary.active).toBe(2);
    });

    it('should isolate job applications between users', async () => {
      const appDoc = await JobApplication.create({
        user: aliceUser._id,
        company: 'Apple',
        role: 'CoreOS Engineer',
        status: 'APPLIED',
      });

      const res = await request(app)
        .get(`/api/placements/jobs/${appDoc._id}`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(404);
    });
  });
});
