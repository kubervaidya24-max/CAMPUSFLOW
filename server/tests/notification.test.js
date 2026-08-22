import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { io as ioClient } from 'socket.io-client';
import app from '../src/app.js';
import { initSocketServer } from '../src/socket/socketServer.js';
import { User } from '../src/models/User.js';
import { Project } from '../src/models/Project.js';
import { Task } from '../src/models/Task.js';
import { Notification } from '../src/models/Notification.js';
import { notificationService } from '../src/services/notificationService.js';

let mongoServer;
let httpServer;
let serverPort;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  httpServer = http.createServer(app);
  initSocketServer(httpServer);

  await new Promise((resolve) => {
    httpServer.listen(0, () => {
      serverPort = httpServer.address().port;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise((resolve) => {
    httpServer.close(() => resolve());
  });
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await Notification.deleteMany({});
});

describe('Centralized Notification Subsystem (Level 7)', () => {
  let aliceToken;
  let aliceUser;
  let bobToken;
  let bobUser;

  beforeEach(async () => {
    // 1. Register Alice
    const aRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Turing',
      email: 'alice@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    aliceToken = aRes.body.data.accessToken;
    aliceUser = aRes.body.data.user;

    // 2. Register Bob
    const bRes = await request(app).post('/api/auth/register').send({
      name: 'Bob Lovelace',
      email: 'bob@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });
    bobToken = bRes.body.data.accessToken;
    bobUser = bRes.body.data.user;
  });

  const createSocketClient = (token) => {
    return ioClient(`http://localhost:${serverPort}`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
  };

  describe('NotificationService Core & Persistence', () => {
    it('should create and persist a notification with proper indexing', async () => {
      const notif = await notificationService.createNotification({
        recipient: aliceUser._id,
        type: 'course_announcement',
        title: 'Welcome to Advanced Distributed Systems',
        message: 'First lecture starts Monday at 9:00 AM in Hall B.',
      });

      expect(notif).toBeDefined();
      expect(notif.title).toBe('Welcome to Advanced Distributed Systems');
      expect(notif.read).toBe(false);

      const saved = await Notification.findById(notif._id);
      expect(saved).toBeDefined();
      expect(saved.recipient.toString()).toBe(aliceUser._id);
    });

    it('should create bulk notifications for multiple recipients', async () => {
      const list = await notificationService.createBulkNotifications(
        [aliceUser._id, bobUser._id],
        {
          type: 'assignment_created',
          title: 'New Assignment: Lab 3',
          message: 'Distributed consensus algorithm implementation due Friday.',
        }
      );

      expect(list).toHaveLength(2);
      const all = await Notification.find({});
      expect(all).toHaveLength(2);
    });
  });

  describe('REST Notification APIs', () => {
    beforeEach(async () => {
      // Create 3 notifications for Alice (2 unread, 1 read)
      await Notification.create([
        {
          recipient: aliceUser._id,
          type: 'task_assignment',
          title: 'Task Assigned',
          message: 'Bob assigned you to ROS2 node configuration.',
          read: false,
        },
        {
          recipient: aliceUser._id,
          type: 'project_invitation',
          title: 'Project Invitation',
          message: 'Charlie invited you to Quantum Kernel.',
          read: false,
        },
        {
          recipient: aliceUser._id,
          type: 'system',
          title: 'Profile Updated',
          message: 'Your profile details were updated.',
          read: true,
        },
      ]);
    });

    it('should retrieve paginated notifications and unread count for authenticated user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notifications).toHaveLength(3);
      expect(res.body.data.unreadCount).toBe(2);
    });

    it('should retrieve unread count via /api/notifications/unread-count', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.unreadCount).toBe(2);
    });

    it('should mark a single notification as read', async () => {
      const notif = await Notification.findOne({ recipient: aliceUser._id, read: false });

      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`)
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notification.read).toBe(true);
      expect(res.body.data.unreadCount).toBe(1);
    });

    it('should mark all notifications as read via /api/notifications/read-all', async () => {
      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.unreadCount).toBe(0);

      const unreadCount = await Notification.countDocuments({
        recipient: aliceUser._id,
        read: false,
      });
      expect(unreadCount).toBe(0);
    });

    it('should forbid users from accessing or modifying another users notification (404 Not Found)', async () => {
      const notif = await Notification.findOne({ recipient: aliceUser._id });

      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Real-Time Notification Delivery via Socket.IO', () => {
    it('should deliver notifications to the user private socket room in real time', async () => {
      const aliceSocket = createSocketClient(aliceToken);

      await new Promise((resolve) => aliceSocket.on('connect', resolve));

      const notifPromise = new Promise((resolve) => {
        aliceSocket.on('new_notification', (data) => resolve(data));
      });

      // Trigger notification via NotificationService
      await notificationService.createNotification({
        recipient: aliceUser._id,
        type: 'faculty_feedback',
        title: 'Assignment Graded',
        message: 'Your Machine Learning assignment was graded: 98/100.',
      });

      const eventData = await notifPromise;
      expect(eventData.notification).toBeDefined();
      expect(eventData.notification.title).toBe('Assignment Graded');
      expect(eventData.notification.message).toContain('98/100');

      aliceSocket.disconnect();
    });

    it('should trigger notification on project invitation event', async () => {
      // 1. Alice creates a project
      const pRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Distributed Neural Engine',
          description: 'High-performance AI model serving.',
        });
      const project = pRes.body.data.project;

      // 2. Bob listens for notifications
      const bobSocket = createSocketClient(bobToken);
      await new Promise((resolve) => bobSocket.on('connect', resolve));

      const inviteNotifPromise = new Promise((resolve) => {
        bobSocket.on('new_notification', (data) => resolve(data));
      });

      // 3. Alice invites Bob
      await request(app)
        .post(`/api/projects/${project._id}/invitations`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ email: 'bob@campusflow.edu' });

      const notifData = await inviteNotifPromise;
      expect(notifData.notification.type).toBe('project_invitation');
      expect(notifData.notification.message).toContain('Distributed Neural Engine');

      bobSocket.disconnect();
    });
  });
});
