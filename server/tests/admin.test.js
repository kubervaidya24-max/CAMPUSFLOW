import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';
import { Assignment } from '../src/models/Assignment.js';
import { Submission } from '../src/models/Submission.js';
import { Project } from '../src/models/Project.js';
import { Task } from '../src/models/Task.js';
import { ProjectActivity } from '../src/models/ProjectActivity.js';

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
  await Course.deleteMany({});
  await Assignment.deleteMany({});
  await Submission.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await ProjectActivity.deleteMany({});
});

describe('Admin Panel & Moderation Subsystem (Level 11)', () => {
  let adminToken;
  let adminUser;
  let facultyToken;
  let studentToken;
  let studentUser;
  let sampleCourse;
  let sampleProject;

  beforeEach(async () => {
    // 1. Create Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'System Administrator',
      email: 'admin@campusflow.edu',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    adminToken = adminRes.body.data.accessToken;
    adminUser = adminRes.body.data.user;

    // 2. Create Faculty
    const facultyRes = await request(app).post('/api/auth/register').send({
      name: 'Prof. Turing',
      email: 'turing@campusflow.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Computer Science',
    });
    facultyToken = facultyRes.body.data.accessToken;

    // 3. Create Student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    studentToken = studentRes.body.data.accessToken;
    studentUser = studentRes.body.data.user;

    // 4. Create Sample Course
    sampleCourse = await Course.create({
      title: 'Operating Systems Internal',
      code: 'CS401',
      description: 'Kernel architectures and system calls.',
      department: 'Computer Science',
      semester: 5,
      credits: 4,
      faculty: facultyRes.body.data.user._id,
      status: 'published',
      enrolledStudents: [{ student: studentUser._id }],
    });

    // 5. Create Sample Project
    sampleProject = await Project.create({
      title: 'Microkernel OS',
      description: 'Educational Rust-based kernel.',
      owner: studentUser._id,
      status: 'active',
      members: [{ user: studentUser._id, role: 'owner' }],
    });
  });

  describe('Server-Side Role Authorization & Route Protection', () => {
    it('should forbid students from accessing admin stats (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should forbid faculty from accessing admin user management (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin users to access platform stats (200 OK)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users.total).toBe(3);
      expect(res.body.data.users.students).toBe(1);
      expect(res.body.data.users.faculty).toBe(1);
      expect(res.body.data.users.admins).toBe(1);
      expect(res.body.data.academics.totalCourses).toBe(1);
      expect(res.body.data.projects.totalProjects).toBe(1);
    });
  });

  describe('User Management & Server-Side Pagination', () => {
    it('should retrieve paginated user list with search and filter capabilities', async () => {
      const res = await request(app)
        .get('/api/admin/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(3);
      expect(res.body.data.pagination.totalPages).toBe(2);
    });

    it('should filter users by search query name or email', async () => {
      const res = await request(app)
        .get('/api/admin/users?q=Ada')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users).toHaveLength(1);
      expect(res.body.data.users[0].name).toBe('Ada Lovelace');
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=faculty')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users).toHaveLength(1);
      expect(res.body.data.users[0].email).toBe('turing@campusflow.edu');
    });
  });

  describe('User Suspension & Account Reactivation', () => {
    it('should allow admin to suspend user and block login attempts', async () => {
      // 1. Suspend Student Ada
      const patchRes = await request(app)
        .patch(`/api/admin/users/${studentUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.user.isActive).toBe(false);

      // 2. Suspended user attempts login
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'ada@campusflow.edu',
        password: 'Password123!',
      });

      expect(loginRes.status).toBe(403);
      expect(loginRes.body.message).toMatch(/suspended/i);

      // 3. Reactivate account
      const reactivateRes = await request(app)
        .patch(`/api/admin/users/${studentUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.data.user.isActive).toBe(true);

      // 4. Login succeeds after reactivation
      const loginSuccessRes = await request(app).post('/api/auth/login').send({
        email: 'ada@campusflow.edu',
        password: 'Password123!',
      });

      expect(loginSuccessRes.status).toBe(200);
    });

    it('should prevent admin from suspending their own account (lockout prevention)', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot suspend their own account/i);
    });
  });

  describe('Course Moderation & Content Management', () => {
    it('should allow admin to moderate course status and delete inappropriate courses', async () => {
      // 1. Update course status to archived
      const updateRes = await request(app)
        .patch(`/api/admin/courses/${sampleCourse._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'archived' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.course.status).toBe('archived');

      // 2. Delete course
      const deleteRes = await request(app)
        .delete(`/api/admin/courses/${sampleCourse._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);

      const checkCourse = await Course.findById(sampleCourse._id);
      expect(checkCourse).toBeNull();
    });
  });

  describe('Project Moderation', () => {
    it('should allow admin to moderate and delete projects', async () => {
      // 1. Update project status
      const updateRes = await request(app)
        .patch(`/api/admin/projects/${sampleProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.project.status).toBe('completed');

      // 2. Delete project
      const deleteRes = await request(app)
        .delete(`/api/admin/projects/${sampleProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);

      const checkProject = await Project.findById(sampleProject._id);
      expect(checkProject).toBeNull();
    });
  });

  describe('System Reports & Activity Audit', () => {
    it('should return recent system activities and registered users', async () => {
      const res = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.recentUsers).toBeInstanceOf(Array);
      expect(res.body.data.recentUsers.length).toBeGreaterThan(0);
    });
  });
});
