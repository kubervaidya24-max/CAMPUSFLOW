import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';

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
});

describe('Academic Course Management Subsystem (Level 3)', () => {
  let facultyToken;
  let facultyUser;
  let otherFacultyToken;
  let studentToken;
  let secondStudentToken;

  beforeEach(async () => {
    // 1. Register Primary Faculty
    const fRes = await request(app).post('/api/auth/register').send({
      name: 'Prof. Albus Dumbledore',
      email: 'dumbledore@campusflow.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Computer Science',
    });
    facultyToken = fRes.body.data.accessToken;
    facultyUser = fRes.body.data.user;

    // 2. Register Secondary Faculty
    const otherFRes = await request(app).post('/api/auth/register').send({
      name: 'Prof. Severus Snape',
      email: 'snape@campusflow.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Software Engineering',
    });
    otherFacultyToken = otherFRes.body.data.accessToken;

    // 3. Register Primary Student
    const sRes = await request(app).post('/api/auth/register').send({
      name: 'Harry Potter',
      email: 'harry@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    studentToken = sRes.body.data.accessToken;

    // 4. Register Second Student
    const s2Res = await request(app).post('/api/auth/register').send({
      name: 'Hermione Granger',
      email: 'hermione@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    secondStudentToken = s2Res.body.data.accessToken;
  });

  describe('Course Creation (POST /api/courses)', () => {
    it('should allow faculty to create a new course with 201 status', async () => {
      const coursePayload = {
        title: 'Distributed Systems & Cloud Architecture',
        code: 'CS401',
        description: 'Deep dive into distributed consensus, Raft, Paxos, and microservices.',
        department: 'Computer Science',
        semester: 7,
        credits: 4,
        capacity: 40,
        status: 'published',
        syllabus: [
          { week: 1, title: 'Introduction to Distributed Systems', description: 'CAP theorem, RPC' },
          { week: 2, title: 'Consensus & Replication', description: 'Raft algorithm' },
        ],
        schedule: { days: ['Mon', 'Wed'], time: '10:00 AM - 11:30 AM', room: 'Hall B-201' },
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(coursePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.course.code).toBe('CS401');
      expect(response.body.data.course.credits).toBe(4);
      expect(response.body.data.course.faculty._id).toBe(facultyUser._id);
      expect(response.body.data.course.syllabus).toHaveLength(2);
    });

    it('should forbid a student from creating a course (403 Forbidden)', async () => {
      const coursePayload = {
        title: 'Hacking 101',
        code: 'SEC101',
        description: 'Student-run unauthorized course',
        department: 'Computer Science',
        semester: 1,
        credits: 3,
        capacity: 20,
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(coursePayload);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate course codes with 409 Conflict', async () => {
      const coursePayload = {
        title: 'Database Systems',
        code: 'CS202',
        description: 'Relational & NoSQL databases',
        department: 'Computer Science',
        semester: 4,
        credits: 3,
        capacity: 50,
      };

      // Create first instance
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(coursePayload);

      // Attempt duplicate code
      const duplicateRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ ...coursePayload, title: 'Another DB Course' });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toContain('already exists');
    });
  });

  describe('Course Exploration & Filters (GET /api/courses)', () => {
    beforeEach(async () => {
      // Create Published Course
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Algorithms & Data Structures',
          code: 'CS102',
          description: 'Fundamental algorithmic analysis and asymptotic bounds.',
          department: 'Computer Science',
          semester: 2,
          credits: 4,
          capacity: 60,
          status: 'published',
        });

      // Create Draft Course
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Quantum Computing Preview',
          code: 'QC501',
          description: 'Draft course under faculty preparation.',
          department: 'Computer Science',
          semester: 8,
          credits: 3,
          capacity: 30,
          status: 'draft',
        });
    });

    it('should return published courses for students and omit drafts', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.courses).toHaveLength(1);
      expect(response.body.data.courses[0].code).toBe('CS102');
    });

    it('should allow faculty to view their own draft courses', async () => {
      const response = await request(app)
        .get('/api/courses?facultyOnly=true')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.courses).toHaveLength(2);
    });

    it('should filter courses by department and semester', async () => {
      const response = await request(app)
        .get('/api/courses?department=Computer%20Science&semester=2')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.courses).toHaveLength(1);
      expect(response.body.data.courses[0].code).toBe('CS102');
    });

    it('should search courses by keyword query', async () => {
      const response = await request(app)
        .get('/api/courses?search=algorithms')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.courses).toHaveLength(1);
      expect(response.body.data.courses[0].title).toBe('Algorithms & Data Structures');
    });
  });

  describe('Course Updates & Ownership Authorization (PATCH /api/courses/:id)', () => {
    let createdCourse;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Compiler Design',
          code: 'CS303',
          description: 'Lexical analysis, parsing, and code generation.',
          department: 'Computer Science',
          semester: 5,
          credits: 3,
          capacity: 45,
          status: 'draft',
        });
      createdCourse = res.body.data.course;
    });

    it('should allow the owning faculty to update the course and publish it', async () => {
      const response = await request(app)
        .patch(`/api/courses/${createdCourse._id}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Advanced Compiler Design & Optimization',
          status: 'published',
          capacity: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.course.title).toBe('Advanced Compiler Design & Optimization');
      expect(response.body.data.course.status).toBe('published');
      expect(response.body.data.course.capacity).toBe(50);
    });

    it('should forbid non-owning faculty from modifying the course (403 Forbidden)', async () => {
      const response = await request(app)
        .patch(`/api/courses/${createdCourse._id}`)
        .set('Authorization', `Bearer ${otherFacultyToken}`)
        .send({ title: 'Hijacked Course Title' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });

    it('should forbid a student from modifying any course (403 Forbidden)', async () => {
      const response = await request(app)
        .patch(`/api/courses/${createdCourse._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ capacity: 100 });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Student Enrollment & Unenrollment Flows', () => {
    let publishedCourse;
    let fullCapacityCourse;

    beforeEach(async () => {
      // Regular published course
      const pubRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Web Engineering & Full Stack Dev',
          code: 'SE201',
          description: 'MERN stack engineering and modern web development.',
          department: 'Software Engineering',
          semester: 4,
          credits: 3,
          capacity: 30,
          status: 'published',
        });
      publishedCourse = pubRes.body.data.course;

      // Full capacity course (capacity: 1)
      const fullRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Exclusive Research Seminar',
          code: 'RES901',
          description: 'Limited seat seminar.',
          department: 'Computer Science',
          semester: 8,
          credits: 2,
          capacity: 1,
          status: 'published',
        });
      fullCapacityCourse = fullRes.body.data.course;
    });

    it('should allow a student to enroll in an open published course (200 OK)', async () => {
      const response = await request(app)
        .post(`/api/courses/${publishedCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('enrolled in course');
      expect(response.body.data.enrolledCount).toBe(1);

      // Verify course details reflect enrollment
      const detailsRes = await request(app)
        .get(`/api/courses/${publishedCourse._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(detailsRes.body.data.isEnrolled).toBe(true);
    });

    it('should reject duplicate enrollment with 409 Conflict', async () => {
      // First enrollment
      await request(app)
        .post(`/api/courses/${publishedCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Second enrollment attempt
      const duplicateRes = await request(app)
        .post(`/api/courses/${publishedCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toContain('already enrolled');
    });

    it('should reject enrollment when course capacity is reached (400 Bad Request)', async () => {
      // Student 1 fills capacity (1/1)
      await request(app)
        .post(`/api/courses/${fullCapacityCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Student 2 attempts to enroll
      const fullRes = await request(app)
        .post(`/api/courses/${fullCapacityCourse._id}/enroll`)
        .set('Authorization', `Bearer ${secondStudentToken}`);

      expect(fullRes.status).toBe(400);
      expect(fullRes.body.success).toBe(false);
      expect(fullRes.body.message).toContain('capacity limit reached');
    });

    it('should allow enrolled student to unenroll/leave course (200 OK)', async () => {
      // Enroll
      await request(app)
        .post(`/api/courses/${publishedCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Leave
      const unenrollRes = await request(app)
        .delete(`/api/courses/${publishedCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(unenrollRes.status).toBe(200);
      expect(unenrollRes.body.success).toBe(true);
      expect(unenrollRes.body.data.enrolledCount).toBe(0);
    });

    it('should reject unenrollment if student is not enrolled (400 Bad Request)', async () => {
      const response = await request(app)
        .delete(`/api/courses/${publishedCourse._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not enrolled');
    });
  });

  describe('Course Deletion (DELETE /api/courses/:id)', () => {
    it('should allow owning faculty to delete course', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Obsolete Course',
          code: 'OBS101',
          description: 'To be deleted',
          department: 'Computer Science',
          semester: 1,
          credits: 1,
          capacity: 10,
        });
      const courseId = res.body.data.course._id;

      const deleteRes = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const checkRes = await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
