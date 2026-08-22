import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
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
  await Project.deleteMany({});
  await Task.deleteMany({});
  await ProjectActivity.deleteMany({});
});

describe('Project Collaboration & Kanban Subsystem (Level 5)', () => {
  let ownerToken;
  let ownerUser;
  let collaboratorToken;
  let collaboratorUser;
  let outsiderToken;

  beforeEach(async () => {
    // 1. Register Project Owner (Student A)
    const oRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Turing',
      email: 'alice@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    ownerToken = oRes.body.data.accessToken;
    ownerUser = oRes.body.data.user;

    // 2. Register Collaborator (Student B)
    const cRes = await request(app).post('/api/auth/register').send({
      name: 'Bob Lovelace',
      email: 'bob@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    collaboratorToken = cRes.body.data.accessToken;
    collaboratorUser = cRes.body.data.user;

    // 3. Register Outsider (Student C)
    const outRes = await request(app).post('/api/auth/register').send({
      name: 'Charlie Outsider',
      email: 'charlie@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Information Technology',
    });
    outsiderToken = outRes.body.data.accessToken;
  });

  describe('Project Creation & Workspace Access', () => {
    it('should allow student to create a collaborative project (201 Created)', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'CampusFlow Cloud Platform',
          description: 'A unified student academic hub built with MERN stack.',
          technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
          repositoryUrl: 'https://github.com/alice/campusflow',
          status: 'active',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.project.title).toBe('CampusFlow Cloud Platform');
      expect(response.body.data.project.owner._id).toBe(ownerUser._id);
      expect(response.body.data.project.members).toHaveLength(1);
      expect(response.body.data.project.technologies).toContain('React');
    });

    it('should forbid non-members from viewing project workspace details (403 Forbidden)', async () => {
      const pRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Secret Core Kernel',
          description: 'Internal OS Kernel project.',
        });
      const projectId = pRes.body.data.project._id;

      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('access');
    });
  });

  describe('Team Management & Invitation Flow', () => {
    let project;

    beforeEach(async () => {
      const pRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Distributed File Store',
          description: 'Peer-to-peer decentralized storage network.',
          technologies: ['Go', 'gRPC', 'Raft'],
        });
      project = pRes.body.data.project;
    });

    it('should allow owner to invite a member and handle acceptance flow', async () => {
      // 1. Owner sends invitation to Bob
      const inviteRes = await request(app)
        .post(`/api/projects/${project._id}/invitations`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'bob@campusflow.edu', role: 'member' });

      expect(inviteRes.status).toBe(200);
      expect(inviteRes.body.success).toBe(true);

      // 2. Bob fetches project invitations
      const pendingRes = await request(app)
        .get('/api/projects?scope=invitations')
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(pendingRes.status).toBe(200);
      expect(pendingRes.body.data.projects).toHaveLength(1);

      // 3. Bob accepts the invitation
      const acceptRes = await request(app)
        .post(`/api/projects/${project._id}/invitations/respond`)
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({ action: 'accept' });

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.project.members.some((m) => m.user === collaboratorUser._id)).toBe(true);

      // 4. Bob can now access the project workspace
      const accessRes = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(accessRes.status).toBe(200);
      expect(accessRes.body.data.isMember).toBe(true);
    });

    it('should allow member to leave project and prevent owner from leaving', async () => {
      // Invite and accept Bob
      await request(app)
        .post(`/api/projects/${project._id}/invitations`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'bob@campusflow.edu' });

      await request(app)
        .post(`/api/projects/${project._id}/invitations/respond`)
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({ action: 'accept' });

      // Owner attempts to leave -> Rejected (400)
      const ownerLeaveRes = await request(app)
        .post(`/api/projects/${project._id}/leave`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(ownerLeaveRes.status).toBe(400);
      expect(ownerLeaveRes.body.message).toContain('owner cannot leave');

      // Bob leaves project -> Accepted (200)
      const bobLeaveRes = await request(app)
        .post(`/api/projects/${project._id}/leave`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(bobLeaveRes.status).toBe(200);

      // Verify Bob is no longer a member
      const checkRes = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(checkRes.status).toBe(403);
    });
  });

  describe('Kanban Tasks & Activity Logging Workflow', () => {
    let project;

    beforeEach(async () => {
      const pRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Robotics Autonomous Nav',
          description: 'SLAM and LiDAR obstacle navigation.',
        });
      project = pRes.body.data.project;

      // Add Bob as member
      await request(app)
        .post(`/api/projects/${project._id}/invitations`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'bob@campusflow.edu' });

      await request(app)
        .post(`/api/projects/${project._id}/invitations/respond`)
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({ action: 'accept' });
    });

    it('should create tasks and transition through TODO -> IN_PROGRESS -> DONE with activity logs', async () => {
      // 1. Bob creates a task in the project
      const taskRes = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          title: 'Setup ROS2 Sensor Nodes',
          description: 'Connect camera and LiDAR feeds via ROS2 topics.',
          priority: 'high',
          status: 'TODO',
        });

      expect(taskRes.status).toBe(201);
      const taskId = taskRes.body.data.task._id;
      expect(taskRes.body.data.task.status).toBe('TODO');

      // 2. Move to IN_PROGRESS and assign to Alice
      const moveRes = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          status: 'IN_PROGRESS',
          assigneeId: ownerUser._id,
        });

      expect(moveRes.status).toBe(200);
      expect(moveRes.body.data.task.status).toBe('IN_PROGRESS');
      expect(moveRes.body.data.task.assignee._id).toBe(ownerUser._id);

      // 3. Quick status shift to DONE
      const completeRes = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ status: 'DONE' });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.task.status).toBe('DONE');

      // 4. Retrieve Activity Log and verify events
      const actRes = await request(app)
        .get(`/api/projects/${project._id}/activities`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(actRes.status).toBe(200);
      const actions = actRes.body.data.activities.map((a) => a.action);

      expect(actions).toContain('PROJECT_CREATED');
      expect(actions).toContain('INVITATION_SENT');
      expect(actions).toContain('MEMBER_JOINED');
      expect(actions).toContain('TASK_CREATED');
      expect(actions).toContain('TASK_MOVED');
      expect(actions).toContain('TASK_COMPLETED');
    });

    it('should forbid outsiders from creating or modifying tasks (403 Forbidden)', async () => {
      const response = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ title: 'Malicious Task Injection' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
