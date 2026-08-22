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
  await Course.deleteMany({});
  await Assignment.deleteMany({});
  await Submission.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await ProjectActivity.deleteMany({});
  await DSAProblem.deleteMany({});
  await JobApplication.deleteMany({});
});

describe('Data-Driven Analytics Engine Subsystem (Level 10)', () => {
  let aliceToken;
  let aliceUser;
  let facultyUser;
  let projectDoc;

  beforeEach(async () => {
    // 1. Register Faculty
    const fRes = await request(app).post('/api/auth/register').send({
      name: 'Prof. Turing',
      email: 'prof@campusflow.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Computer Science',
    });
    facultyUser = fRes.body.data.user;

    // 2. Register Student Alice
    const aRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Lovelace',
      email: 'alice@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    aliceToken = aRes.body.data.accessToken;
    aliceUser = aRes.body.data.user;

    // 3. Create 2 Courses and enroll Alice
    const course1 = await Course.create({
      title: 'Advanced Algorithms',
      code: 'CS501',
      description: 'Algorithm design and graph theory.',
      department: 'Computer Science',
      semester: 7,
      credits: 4,
      faculty: facultyUser._id,
      status: 'published',
      enrolledStudents: [{ student: aliceUser._id }],
    });

    const course2 = await Course.create({
      title: 'Distributed Cloud Systems',
      code: 'CS502',
      description: 'Consensus protocols and scalability.',
      department: 'Computer Science',
      semester: 7,
      credits: 4,
      faculty: facultyUser._id,
      status: 'published',
      enrolledStudents: [{ student: aliceUser._id }],
    });

    // 4. Create 2 Assignments
    const asg1 = await Assignment.create({
      title: 'Raft Implementation',
      description: 'Implement distributed consensus in Node.js',
      course: course1._id,
      faculty: facultyUser._id,
      dueDate: new Date(Date.now() + 86400000),
      totalPoints: 100,
      status: 'published',
    });

    await Assignment.create({
      title: 'Graph Traversal Benchmark',
      description: 'Benchmark BFS and DFS on dense graphs',
      course: course2._id,
      faculty: facultyUser._id,
      dueDate: new Date(Date.now() + 86400000),
      totalPoints: 50,
      status: 'published',
    });

    // 5. Create 1 Graded Submission for asg1
    await Submission.create({
      assignment: asg1._id,
      course: course1._id,
      student: aliceUser._id,
      content: 'Consensus implementation source code.',
      status: 'graded',
      grade: {
        score: 95,
        feedback: 'Outstanding consensus implementation.',
        gradedBy: facultyUser._id,
        gradedAt: new Date(),
      },
    });

    // 6. Create 1 Project with tasks
    projectDoc = await Project.create({
      title: 'Distributed Cache Engine',
      description: 'High-throughput in-memory key-value store.',
      owner: aliceUser._id,
      technologies: ['Go', 'gRPC', 'Raft'],
      members: [{ user: aliceUser._id, role: 'owner' }],
    });

    await Task.create([
      {
        project: projectDoc._id,
        title: 'Design Protocol Buffer Schema',
        status: 'DONE',
        priority: 'high',
        assignee: aliceUser._id,
        creator: aliceUser._id,
      },
      {
        project: projectDoc._id,
        title: 'Implement Raft Heartbeats',
        status: 'IN_PROGRESS',
        priority: 'urgent',
        assignee: aliceUser._id,
        creator: aliceUser._id,
      },
      {
        project: projectDoc._id,
        title: 'Add Prometheus Metrics',
        status: 'TODO',
        priority: 'medium',
        assignee: aliceUser._id,
        creator: aliceUser._id,
      },
    ]);

    await ProjectActivity.create({
      project: projectDoc._id,
      user: aliceUser._id,
      action: 'TASK_CREATED',
      details: 'Created Protocol Buffer task',
    });

    // 7. Create DSA Problems
    await DSAProblem.create([
      {
        user: aliceUser._id,
        title: 'LRU Cache',
        topic: 'Arrays',
        difficulty: 'Medium',
        status: 'Solved',
        solvedDate: new Date(),
      },
      {
        user: aliceUser._id,
        title: 'Alien Dictionary',
        topic: 'Graphs',
        difficulty: 'Hard',
        status: 'In Progress',
      },
    ]);

    // 8. Create Job Applications
    await JobApplication.create([
      {
        user: aliceUser._id,
        company: 'Google',
        role: 'Software Engineer Intern',
        status: 'OFFER',
      },
      {
        user: aliceUser._id,
        company: 'Stripe',
        role: 'Backend Engineer',
        status: 'TECHNICAL',
      },
      {
        user: aliceUser._id,
        company: 'Old Corp',
        role: 'Analyst',
        status: 'REJECTED',
      },
    ]);
  });

  describe('Student Holistic Analytics (GET /api/analytics/student)', () => {
    it('should accurately compute academic, assignment, project, and placement metrics', async () => {
      const res = await request(app)
        .get('/api/analytics/student')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      const { academic, assignments, projects, career } = res.body.data;

      // 1. Academic checks
      expect(academic.enrolledCourses).toBe(2);
      expect(academic.totalCredits).toBe(8);
      expect(academic.departmentDistribution[0]._id).toBe('Computer Science');

      // 2. Assignment checks
      expect(assignments.totalAssignments).toBe(2);
      expect(assignments.submittedCount).toBe(1);
      expect(assignments.gradedCount).toBe(1);
      expect(assignments.completionRate).toBe(50); // 1 out of 2 submitted = 50%
      expect(assignments.averageGradePercentage).toBe(95); // 95 / 100 = 95%

      // 3. Project & Task checks
      expect(projects.totalProjects).toBe(1);
      expect(projects.ownedProjects).toBe(1);
      expect(projects.tasks.totalAssigned).toBe(3);
      expect(projects.tasks.completed).toBe(1);
      expect(projects.tasks.inProgress).toBe(1);
      expect(projects.tasks.todo).toBe(1);
      expect(projects.tasks.completionRate).toBe(33); // 1 out of 3 = 33%

      // 4. Career & Placement checks
      expect(career.dsa.totalTracked).toBe(2);
      expect(career.dsa.solvedCount).toBe(1);
      expect(career.dsa.completionPercentage).toBe(50);
      expect(career.jobs.totalApplications).toBe(3);
      expect(career.jobs.activePipeline).toBe(1); // TECHNICAL is active
      expect(career.jobs.offersReceived).toBe(1); // 1 OFFER
      expect(career.jobs.rejections).toBe(1); // 1 REJECTED
      expect(career.jobs.rejectionRate).toBe(33); // 1 out of 3 = 33%
    });
  });

  describe('Project Analytics (GET /api/analytics/project/:projectId)', () => {
    it('should compute task distribution and member contribution for a project', async () => {
      const res = await request(app)
        .get(`/api/analytics/project/${projectDoc._id}`)
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      const { project, tasks, recentActivities } = res.body.data;

      expect(project.title).toBe('Distributed Cache Engine');
      expect(tasks.total).toBe(3);
      expect(tasks.done).toBe(1);
      expect(tasks.inProgress).toBe(1);
      expect(tasks.todo).toBe(1);
      expect(tasks.completionRate).toBe(33);

      // Member contribution
      expect(tasks.memberContribution).toHaveLength(1);
      expect(tasks.memberContribution[0].assignedCount).toBe(3);
      expect(tasks.memberContribution[0].completedCount).toBe(1);

      // Activities
      expect(recentActivities).toHaveLength(1);
      expect(recentActivities[0].action).toBe('TASK_CREATED');
    });
  });

  describe('Placement Funnel Analytics (GET /api/analytics/placement)', () => {
    it('should compute funnel conversion and stage metrics', async () => {
      const res = await request(app)
        .get('/api/analytics/placement')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      const { funnel, dsa } = res.body.data;

      expect(funnel.total).toBe(3);
      expect(funnel.offer).toBe(1);
      expect(funnel.technical).toBe(1);
      expect(funnel.rejected).toBe(1);
      expect(funnel.rejectionRate).toBe(33);
      expect(dsa.difficulty).toHaveLength(2);
    });
  });
});
