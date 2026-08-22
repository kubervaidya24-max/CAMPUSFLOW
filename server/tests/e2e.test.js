import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import http from 'http';
import { io as Client } from 'socket.io-client';
import app from '../src/app.js';
import { initSocketServer } from '../src/socket/socketServer.js';

let mongoServer;
let httpServer;
let socketPort;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  httpServer = http.createServer(app);
  initSocketServer(httpServer);
  await new Promise((resolve) => {
    httpServer.listen(0, () => {
      socketPort = httpServer.address().port;
      resolve();
    });
  });
});

afterAll(async () => {
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Full Monorepo End-to-End (E2E) 10-Step Critical User Journey (Level 12)', () => {
  let facultyToken;
  let studentToken;
  let peerToken;
  let adminToken;
  let courseId;
  let assignmentId;
  let submissionId;
  let projectId;
  let taskId;

  // STEP 1: Registration
  it('Step 1: Registration Flow for Faculty, Student, Peer, and Admin accounts', async () => {
    const fRes = await request(app).post('/api/auth/register').send({
      name: 'Prof. Edsger Dijkstra',
      email: 'dijkstra@campusflow.edu',
      password: 'StrongPassword123!',
      role: 'faculty',
      department: 'Computer Science',
    });
    expect(fRes.status).toBe(201);

    const sRes = await request(app).post('/api/auth/register').send({
      name: 'Donald Knuth',
      email: 'knuth@campusflow.edu',
      password: 'StrongPassword123!',
      role: 'student',
      department: 'Computer Science',
      semester: 5,
    });
    expect(sRes.status).toBe(201);

    const pRes = await request(app).post('/api/auth/register').send({
      name: 'Leslie Lamport',
      email: 'lamport@campusflow.edu',
      password: 'StrongPassword123!',
      role: 'student',
      department: 'Computer Science',
      semester: 5,
    });
    expect(pRes.status).toBe(201);

    const aRes = await request(app).post('/api/auth/register').send({
      name: 'Dennis Ritchie',
      email: 'ritchie@campusflow.edu',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    expect(aRes.status).toBe(201);
  });

  // STEP 2: Login & JWT Tokens
  it('Step 2: Authentication & Token Issuance Flow', async () => {
    const fLogin = await request(app).post('/api/auth/login').send({
      email: 'dijkstra@campusflow.edu',
      password: 'StrongPassword123!',
    });
    expect(fLogin.status).toBe(200);
    facultyToken = fLogin.body.data.accessToken;

    const sLogin = await request(app).post('/api/auth/login').send({
      email: 'knuth@campusflow.edu',
      password: 'StrongPassword123!',
    });
    expect(sLogin.status).toBe(200);
    studentToken = sLogin.body.data.accessToken;

    const pLogin = await request(app).post('/api/auth/login').send({
      email: 'lamport@campusflow.edu',
      password: 'StrongPassword123!',
    });
    expect(pLogin.status).toBe(200);
    peerToken = pLogin.body.data.accessToken;

    const aLogin = await request(app).post('/api/auth/login').send({
      email: 'ritchie@campusflow.edu',
      password: 'AdminPassword123!',
    });
    expect(aLogin.status).toBe(200);
    adminToken = aLogin.body.data.accessToken;
  });

  // STEP 3: Course Creation & Student Enrollment
  it('Step 3: Course Management & Student Enrollment Flow', async () => {
    // Faculty creates draft course
    const cRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        title: 'Advanced Graph Algorithms',
        code: 'CS701',
        description: 'Shortest path, network flow, and graph coloring.',
        department: 'Computer Science',
        semester: 5,
        credits: 4,
        maxCapacity: 40,
      });
    expect(cRes.status).toBe(201);
    courseId = cRes.body.data.course._id;

    // Faculty publishes course
    const pubRes = await request(app)
      .patch(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({ status: 'published' });
    expect(pubRes.status).toBe(200);

    // Student enrolls in published course
    const enrollRes = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(enrollRes.status).toBe(200);
    expect(enrollRes.body.message).toMatch(/enrolled/i);
  });

  // STEP 4: Assignment Creation, Student Submission & Faculty Grading
  it('Step 4: Assignment Lifecycle, Deadline Validation & Faculty Grading Flow', async () => {
    // Faculty creates assignment
    const asgRes = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        title: 'Priority Queue Benchmark',
        description: 'Implement pairing heaps vs Fibonacci heaps.',
        courseId: courseId,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        totalPoints: 100,
        allowLate: true,
        status: 'published',
      });
    expect(asgRes.status).toBe(201);
    assignmentId = asgRes.body.data.assignment._id;

    // Student submits assignment
    const subRes = await request(app)
      .post(`/api/assignments/${assignmentId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        content: 'https://github.com/knuth/pairing-heap-benchmark',
      });
    expect(subRes.status).toBe(200);
    submissionId = subRes.body.data.submission._id;

    // Faculty grades submission
    const gradeRes = await request(app)
      .patch(`/api/submissions/${submissionId}/grade`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        score: 98,
        feedback: 'Outstanding theoretical analysis and benchmark results.',
      });
    expect(gradeRes.status).toBe(200);
    expect(gradeRes.body.data.submission.status).toBe('graded');
    expect(gradeRes.body.data.submission.grade.score).toBe(98);
  });

  // STEP 5: Project Workspace & Team Invitation Flow
  it('Step 5: Project Creation & Member Invitation Acceptance Flow', async () => {
    // Student Knuth creates project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'TeX Type Setting Engine',
        description: 'High quality mathematical typesetting.',
        technologies: ['C', 'WebAssembly', 'React'],
      });
    expect(projRes.status).toBe(201);
    projectId = projRes.body.data.project._id;

    // Knuth invites peer Lamport
    const invRes = await request(app)
      .post(`/api/projects/${projectId}/invitations`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ email: 'lamport@campusflow.edu' });
    expect(invRes.status).toBe(200);

    // Lamport accepts invitation
    const acceptRes = await request(app)
      .post(`/api/projects/${projectId}/invitations/respond`)
      .set('Authorization', `Bearer ${peerToken}`)
      .send({ action: 'accept' });
    expect(acceptRes.status).toBe(200);
  });

  // STEP 6: Kanban Task Board Management
  it('Step 6: Task Board Workflow (TODO -> IN_PROGRESS -> DONE)', async () => {
    // Create task
    const taskRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Hyphenation Algorithm',
        description: 'Implement Liang hyphenation patterns.',
        priority: 'urgent',
        status: 'TODO',
      });
    expect(taskRes.status).toBe(201);
    taskId = taskRes.body.data.task._id;

    // Move to IN_PROGRESS
    const inProgRes = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'IN_PROGRESS' });
    expect(inProgRes.status).toBe(200);

    // Move to DONE
    const doneRes = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'DONE' });
    expect(doneRes.status).toBe(200);
    expect(doneRes.body.data.task.status).toBe('DONE');
  });

  // STEP 7: Real-Time Chat & Socket Persistence
  it('Step 7: Socket.IO Real-Time Messaging & MongoDB Persistence Flow', async () => {
    const socketClient = Client(`http://localhost:${socketPort}`, {
      auth: { token: studentToken },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });

    await new Promise((resolve) => {
      socketClient.on('connect', resolve);
    });

    // Join Project Room
    await new Promise((resolve) => {
      socketClient.emit('join_project', { projectId }, resolve);
    });

    // Send chat message
    await new Promise((resolve) => {
      socketClient.emit(
        'send_message',
        {
          projectId,
          content: 'Hello team, the hyphenation engine is verified and complete.',
        },
        resolve
      );
    });

    socketClient.disconnect();

    // Verify REST message history
    const msgRes = await request(app)
      .get(`/api/projects/${projectId}/messages`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(msgRes.status).toBe(200);
    expect(msgRes.body.data.messages.length).toBeGreaterThan(0);
    expect(msgRes.body.data.messages[0].content).toMatch(/hyphenation engine/i);
  });

  // STEP 8: Centralized Notifications & Read Status
  it('Step 8: Notification Delivery & Atomic Mark-All-As-Read Flow', async () => {
    // Fetch notifications for student Knuth
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(notifRes.status).toBe(200);
    expect(notifRes.body.data.notifications).toBeInstanceOf(Array);

    // Mark all as read
    const readAllRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(readAllRes.status).toBe(200);

    // Verify unread count is 0
    const unreadRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(unreadRes.status).toBe(200);
    expect(unreadRes.body.data.unreadCount).toBe(0);
  });

  // STEP 9: Placement Tracking & Job Application Pipeline
  it('Step 9: DSA Problem Logging & Visual Job Pipeline Progression', async () => {
    // Log DSA Problem
    const dsaRes = await request(app)
      .post('/api/placements/dsa')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Network Delay Time',
        platform: 'LeetCode',
        topic: 'Graphs',
        difficulty: 'Medium',
        status: 'Solved',
      });
    expect(dsaRes.status).toBe(201);

    // Create Job Application
    const jobRes = await request(app)
      .post('/api/placements/jobs')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        company: 'Anthropic',
        role: 'Research Systems Engineer',
        status: 'APPLIED',
      });
    expect(jobRes.status).toBe(201);
    const jobAppId = jobRes.body.data.application._id;

    // Advance through pipeline to OFFER
    const advanceRes = await request(app)
      .patch(`/api/placements/jobs/${jobAppId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'OFFER' });
    expect(advanceRes.status).toBe(200);
    expect(advanceRes.body.data.application.status).toBe('OFFER');
  });

  // STEP 10: Admin Governance & Security Guards
  it('Step 10: Administrative Governance, Analytics, and RBAC Security Guards', async () => {
    // 1. Non-admin is blocked with 403
    const forbiddenRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(forbiddenRes.status).toBe(403);

    // 2. Admin retrieves system stats
    const adminStatsRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminStatsRes.status).toBe(200);
    expect(adminStatsRes.body.data.users.total).toBe(4); // Dijkstra, Knuth, Lamport, Ritchie
    expect(adminStatsRes.body.data.academics.totalCourses).toBe(1);
    expect(adminStatsRes.body.data.projects.totalProjects).toBe(1);

    // 3. Admin inspects user directory
    const usersRes = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(usersRes.status).toBe(200);
    expect(usersRes.body.data.users.length).toBe(4);
  });
});
