import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';
import { Assignment } from '../src/models/Assignment.js';
import { Submission } from '../src/models/Submission.js';

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
});

describe('Assignment & Submission Management Subsystem (Level 4)', () => {
  let facultyToken;
  let otherFacultyToken;
  let studentToken;
  let nonEnrolledStudentToken;
  let course;

  beforeEach(async () => {
    // 1. Primary Faculty
    const fRes = await request(app).post('/api/auth/register').send({
      name: 'Prof. Minerva McGonagall',
      email: 'minerva@campusflow.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Computer Science',
    });
    facultyToken = fRes.body.data.accessToken;

    // 2. Secondary Faculty
    const f2Res = await request(app).post('/api/auth/register').send({
      name: 'Prof. Severus Snape',
      email: 'snape@campusflow.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Software Engineering',
    });
    otherFacultyToken = f2Res.body.data.accessToken;

    // 3. Enrolled Student
    const sRes = await request(app).post('/api/auth/register').send({
      name: 'Ron Weasley',
      email: 'ron@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    studentToken = sRes.body.data.accessToken;

    // 4. Non-Enrolled Student
    const s2Res = await request(app).post('/api/auth/register').send({
      name: 'Draco Malfoy',
      email: 'draco@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    nonEnrolledStudentToken = s2Res.body.data.accessToken;

    // 5. Create Course
    const cRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        title: 'Advanced Operating Systems',
        code: 'CS302',
        description: 'Kernel architectures, threads, and IPC.',
        department: 'Computer Science',
        semester: 5,
        credits: 4,
        capacity: 50,
        status: 'published',
      });
    course = cRes.body.data.course;

    // 6. Enroll primary student into course
    await request(app)
      .post(`/api/courses/${course._id}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);
  });

  describe('Assignment Creation & Ownership (POST /api/assignments)', () => {
    it('should allow course faculty to create an assignment (201 Created)', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Lab 1: User-Space Thread Scheduler',
          description: 'Implement cooperative thread context switching in C.',
          courseId: course._id,
          dueDate: futureDate,
          totalPoints: 100,
          allowLate: true,
          attachments: [
            { name: 'scheduler_starter.zip', url: 'https://campusflow.edu/files/starter.zip', size: 10240 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignment.title).toBe('Lab 1: User-Space Thread Scheduler');
      expect(response.body.data.assignment.totalPoints).toBe(100);
      expect(response.body.data.assignment.attachments).toHaveLength(1);
    });

    it('should forbid students from creating assignments (403 Forbidden)', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Assignment',
          description: 'Testing permissions',
          courseId: course._id,
          dueDate: futureDate,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should forbid non-owning faculty from creating an assignment for the course (403 Forbidden)', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${otherFacultyToken}`)
        .send({
          title: 'Hijacked Assignment',
          description: 'Testing permissions',
          courseId: course._id,
          dueDate: futureDate,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });
  });

  describe('Student Submission Flow & Deadline Validation (POST /api/assignments/:id/submit)', () => {
    let openAssignment;
    let strictPastAssignment;
    let lateAllowedPastAssignment;

    beforeEach(async () => {
      // 1. Open Assignment (Future due date)
      const openRes = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Lab 2: Virtual Memory Paging',
          description: 'Implement page replacement algorithms.',
          courseId: course._id,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          totalPoints: 100,
          allowLate: true,
        });
      openAssignment = openRes.body.data.assignment;

      // 2. Past Deadline with allowLate = false
      const strictRes = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Quiz 1: Architecture Warmup',
          description: 'Strict no-late submission quiz.',
          courseId: course._id,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          totalPoints: 50,
          allowLate: false,
        });
      strictPastAssignment = strictRes.body.data.assignment;

      // 3. Past Deadline with allowLate = true
      const lateRes = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Lab 3: File System Inodes',
          description: 'Allows late submissions.',
          courseId: course._id,
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          totalPoints: 100,
          allowLate: true,
        });
      lateAllowedPastAssignment = lateRes.body.data.assignment;
    });

    it('should allow enrolled student to submit on time (200 OK, status: submitted)', async () => {
      const response = await request(app)
        .post(`/api/assignments/${openAssignment._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          content: 'https://github.com/ron/virtual-memory-paging',
          attachments: [
            { name: 'report.pdf', url: 'https://campusflow.edu/reports/ron.pdf', size: 5120 },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.submission.status).toBe('submitted');
      expect(response.body.data.submission.content).toContain('github.com/ron');
    });

    it('should forbid non-enrolled students from submitting (403 Forbidden)', async () => {
      const response = await request(app)
        .post(`/api/assignments/${openAssignment._id}/submit`)
        .set('Authorization', `Bearer ${nonEnrolledStudentToken}`)
        .send({ content: 'https://github.com/draco/unauthorized' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('enrolled');
    });

    it('should reject submission when past deadline and allowLate is false (400 Bad Request)', async () => {
      const response = await request(app)
        .post(`/api/assignments/${strictPastAssignment._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'Late quiz attempt' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('deadline has passed');
    });

    it('should accept submission when past deadline and allowLate is true (200 OK, status: late)', async () => {
      const response = await request(app)
        .post(`/api/assignments/${lateAllowedPastAssignment._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'https://github.com/ron/file-system-late' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.submission.status).toBe('late');
    });

    it('should allow student to update their submission before deadline', async () => {
      // First submission
      await request(app)
        .post(`/api/assignments/${openAssignment._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'Initial draft' });

      // Update submission
      const updateRes = await request(app)
        .post(`/api/assignments/${openAssignment._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'Final polished implementation with bugfixes' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.submission.content).toBe('Final polished implementation with bugfixes');

      // Verify single submission record in DB
      const count = await Submission.countDocuments({
        assignment: openAssignment._id,
      });
      expect(count).toBe(1);
    });
  });

  describe('Faculty Grading Subsystem (PATCH /api/submissions/:id/grade)', () => {
    let assignment;
    let submission;

    beforeEach(async () => {
      const aRes = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Project 1: Multiprocessor Synchronization',
          description: 'Spinlocks and Semaphores implementation.',
          courseId: course._id,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          totalPoints: 100,
        });
      assignment = aRes.body.data.assignment;

      const sRes = await request(app)
        .post(`/api/assignments/${assignment._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'https://github.com/ron/synchronization-project' });
      submission = sRes.body.data.submission;
    });

    it('should allow owning faculty to grade a submission with score and feedback (200 OK)', async () => {
      const response = await request(app)
        .patch(`/api/submissions/${submission._id}/grade`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          score: 95,
          feedback: 'Excellent implementation of ticket locks and deadlock prevention.',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.submission.status).toBe('graded');
      expect(response.body.data.submission.grade.score).toBe(95);
      expect(response.body.data.submission.grade.feedback).toContain('Excellent implementation');
    });

    it('should reject grading when score exceeds maximum total points (400 Bad Request)', async () => {
      const response = await request(app)
        .patch(`/api/submissions/${submission._id}/grade`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ score: 150, feedback: 'Invalid marks' }); // Max is 100

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('maximum points');
    });

    it('should forbid students from grading submissions (403 Forbidden)', async () => {
      const response = await request(app)
        .patch(`/api/submissions/${submission._id}/grade`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ score: 100 });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should forbid other faculty from grading the submission (403 Forbidden)', async () => {
      const response = await request(app)
        .patch(`/api/submissions/${submission._id}/grade`)
        .set('Authorization', `Bearer ${otherFacultyToken}`)
        .send({ score: 80 });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
