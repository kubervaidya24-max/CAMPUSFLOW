import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Resume } from '../src/models/Resume.js';
import { Project } from '../src/models/Project.js';

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
  await Resume.deleteMany({});
  await Project.deleteMany({});
});

describe('Dynamic Resume Builder Subsystem (Level 9)', () => {
  let aliceToken;
  let aliceUser;
  let bobToken;

  beforeEach(async () => {
    // 1. Register Alice with profile information
    const aRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Turing',
      email: 'alice@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science & Engineering',
    });
    aliceToken = aRes.body.data.accessToken;
    aliceUser = aRes.body.data.user;

    // Update Alice's profile with skills & bio
    await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        profile: {
          bio: 'Distributed systems researcher and full-stack software engineer.',
          skills: ['React', 'Node.js', 'MongoDB', 'Distributed Algorithms'],
          socialLinks: {
            github: 'https://github.com/alicing',
            linkedin: 'https://linkedin.com/in/alicing',
          },
        },
      });

    // 2. Register Bob
    const bRes = await request(app).post('/api/auth/register').send({
      name: 'Bob Lovelace',
      email: 'bob@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Information Science',
    });
    bobToken = bRes.body.data.accessToken;
  });

  describe('Resume CRUD Operations', () => {
    it('should allow user to create a new structured resume (201 Created)', async () => {
      const res = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Full Stack Engineer Resume',
          template: 'modern',
          personalInfo: {
            fullName: 'Alice Turing',
            email: 'alice@campusflow.edu',
            phone: '+1 555-0199',
            location: 'San Francisco, CA',
            headline: 'Senior Full Stack Engineer',
            summary: 'Passionate about building scalable distributed systems.',
          },
          education: [
            {
              institution: 'State University',
              degree: 'B.Tech in Computer Science',
              fieldOfStudy: 'Computer Science',
              startDate: '2023',
              endDate: '2027',
              current: true,
              grade: '3.9 GPA',
            },
          ],
          skills: [
            {
              category: 'Languages',
              items: ['JavaScript', 'TypeScript', 'Go', 'Python'],
            },
          ],
          projects: [
            {
              title: 'CampusFlow Monorepo',
              role: 'Lead Architect',
              technologies: ['React', 'Express', 'Socket.IO', 'MongoDB'],
              repositoryUrl: 'https://github.com/campusflow',
              highlights: ['Architected 9 complete feature modules with zero lint warnings.'],
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.resume.title).toBe('Full Stack Engineer Resume');
      expect(res.body.data.resume.template).toBe('modern');
      expect(res.body.data.resume.personalInfo.fullName).toBe('Alice Turing');
      expect(res.body.data.resume.education).toHaveLength(1);
      expect(res.body.data.resume.skills).toHaveLength(1);
      expect(res.body.data.resume.projects).toHaveLength(1);
    });

    it('should retrieve list of resumes for authenticated user', async () => {
      await Resume.create([
        {
          user: aliceUser._id,
          title: 'Software Engineer Resume',
          template: 'modern',
        },
        {
          user: aliceUser._id,
          title: 'DevOps / Cloud Resume',
          template: 'dual-column',
        },
      ]);

      const res = await request(app)
        .get('/api/resumes')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.resumes).toHaveLength(2);
    });

    it('should update resume layout template and details (PATCH /api/resumes/:id)', async () => {
      const resume = await Resume.create({
        user: aliceUser._id,
        title: 'Draft Resume',
        template: 'modern',
      });

      const res = await request(app)
        .patch(`/api/resumes/${resume._id}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Polished Executive Resume',
          template: 'dual-column',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.resume.title).toBe('Polished Executive Resume');
      expect(res.body.data.resume.template).toBe('dual-column');
    });

    it('should delete a resume (DELETE /api/resumes/:id)', async () => {
      const resume = await Resume.create({
        user: aliceUser._id,
        title: 'To Be Deleted',
      });

      const res = await request(app)
        .delete(`/api/resumes/${resume._id}`)
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);

      const check = await Resume.findById(resume._id);
      expect(check).toBeNull();
    });

    it('should enforce user data isolation (Bob cannot access Alice resume)', async () => {
      const resume = await Resume.create({
        user: aliceUser._id,
        title: 'Secret Resume',
      });

      const res = await request(app)
        .get(`/api/resumes/${resume._id}`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Profile & Project Auto-Fill Engine (GET /api/resumes/auto-fill)', () => {
    it('should extract student profile and active projects into a ready-to-use draft resume', async () => {
      // 1. Create a project owned by Alice
      await Project.create({
        title: 'Distributed Consensus Engine',
        description: 'Fault-tolerant consensus algorithm implementation in Node.js.',
        owner: aliceUser._id,
        technologies: ['Node.js', 'Socket.IO', 'Raft Protocol'],
        repositoryUrl: 'https://github.com/alicing/consensus',
      });

      // 2. Call auto-fill
      const res = await request(app)
        .get('/api/resumes/auto-fill')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      const { draft } = res.body.data;

      expect(draft.personalInfo.fullName).toBe('Alice Turing');
      expect(draft.personalInfo.email).toBe('alice@campusflow.edu');
      expect(draft.personalInfo.summary).toContain('Distributed systems researcher');
      expect(draft.links.github).toBe('https://github.com/alicing');
      expect(draft.links.linkedin).toBe('https://linkedin.com/in/alicing');

      // Check projects auto-populated
      expect(draft.projects).toHaveLength(1);
      expect(draft.projects[0].title).toBe('Distributed Consensus Engine');
      expect(draft.projects[0].role).toContain('Project Lead');

      // Check skills auto-populated
      const langSkill = draft.skills.find((s) => s.category.includes('Languages'));
      expect(langSkill.items).toContain('React');
      expect(langSkill.items).toContain('Distributed Algorithms');
    });
  });
});
