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
import { Message } from '../src/models/Message.js';

let mongoServer;
let httpServer;
let serverPort;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Start temporary HTTP & Socket server for tests
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
  await Message.deleteMany({});
});

describe('Real-Time Chat & Socket.IO Subsystem (Level 6)', () => {
  let aliceToken;
  let aliceUser;
  let bobToken;
  let outsiderToken;
  let projectA;
  let projectB;

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

    // 3. Register Outsider
    const oRes = await request(app).post('/api/auth/register').send({
      name: 'Charlie Outsider',
      email: 'charlie@campusflow.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Information Technology',
    });
    outsiderToken = oRes.body.data.accessToken;

    // 4. Create Project A with Alice as owner and Bob as member
    const pRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Project Alpha Realtime',
        description: 'Collaborative development space Alpha.',
      });
    projectA = pRes.body.data.project;

    // Invite & accept Bob into Project A
    await request(app)
      .post(`/api/projects/${projectA._id}/invitations`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ email: 'bob@campusflow.edu' });

    await request(app)
      .post(`/api/projects/${projectA._id}/invitations/respond`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ action: 'accept' });

    // 5. Create Project B with only Alice
    const pbRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Project Beta Private',
        description: 'Private isolated Beta workspace.',
      });
    projectB = pbRes.body.data.project;
  });

  const createSocketClient = (token) => {
    return ioClient(`http://localhost:${serverPort}`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
  };

  describe('Socket Handshake Authentication & Security', () => {
    it('should reject unauthenticated socket connection attempts', async () => {
      const socket = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
      });

      const err = await new Promise((resolve) => {
        socket.on('connect_error', (error) => resolve(error));
      });

      expect(err.message).toContain('Authentication error');
      socket.disconnect();
    });

    it('should reject socket connection with invalid JWT token', async () => {
      const socket = createSocketClient('invalid-bogus-token-12345');

      const err = await new Promise((resolve) => {
        socket.on('connect_error', (error) => resolve(error));
      });

      expect(err.message).toContain('Authentication error');
      socket.disconnect();
    });

    it('should establish socket connection successfully with valid user token', async () => {
      const socket = createSocketClient(aliceToken);

      await new Promise((resolve, reject) => {
        socket.on('connect', resolve);
        socket.on('connect_error', reject);
      });

      expect(socket.connected).toBe(true);
      socket.disconnect();
    });
  });

  describe('Room Authorization & Membership Guards', () => {
    it('should allow active project members to join project room', async () => {
      const socket = createSocketClient(aliceToken);

      await new Promise((resolve) => socket.on('connect', resolve));

      const joinResult = await new Promise((resolve) => {
        socket.emit('join_project', { projectId: projectA._id }, (res) => resolve(res));
      });

      expect(joinResult.success).toBe(true);
      expect(joinResult.projectId).toBe(projectA._id);
      expect(joinResult.onlineUsers).toContain(aliceUser._id);
      socket.disconnect();
    });

    it('should forbid non-members from joining project room (403 Forbidden)', async () => {
      const socket = createSocketClient(outsiderToken);

      await new Promise((resolve) => socket.on('connect', resolve));

      const [errEvent, callbackRes] = await new Promise((resolve) => {
        let eventPayload = null;
        socket.on('room_error', (err) => {
          eventPayload = err;
        });

        socket.emit('join_project', { projectId: projectA._id }, (res) => {
          resolve([eventPayload, res]);
        });
      });

      expect(errEvent || callbackRes).toBeDefined();
      const err = errEvent || callbackRes;
      expect(err.code).toBe(403);
      expect(err.message).toContain('Forbidden');
      socket.disconnect();
    });
  });

  describe('Real-Time Message Broadcast, MongoDB Persistence & Isolation', () => {
    it('should broadcast messages to all room members and persist to MongoDB', async () => {
      const aliceSocket = createSocketClient(aliceToken);
      const bobSocket = createSocketClient(bobToken);

      await Promise.all([
        new Promise((resolve) => aliceSocket.on('connect', resolve)),
        new Promise((resolve) => bobSocket.on('connect', resolve)),
      ]);

      // Both join Project A
      await Promise.all([
        new Promise((resolve) =>
          aliceSocket.emit('join_project', { projectId: projectA._id }, resolve)
        ),
        new Promise((resolve) =>
          bobSocket.emit('join_project', { projectId: projectA._id }, resolve)
        ),
      ]);

      // Bob listens for new_message
      const messagePromise = new Promise((resolve) => {
        bobSocket.on('new_message', (payload) => resolve(payload));
      });

      // Alice sends message
      const sendAck = await new Promise((resolve) => {
        aliceSocket.emit(
          'send_message',
          {
            projectId: projectA._id,
            content: 'Hello Bob! Welcome to the real-time project workspace.',
          },
          resolve
        );
      });

      expect(sendAck.success).toBe(true);
      expect(sendAck.message.content).toBe(
        'Hello Bob! Welcome to the real-time project workspace.'
      );

      const received = await messagePromise;
      expect(received.projectId).toBe(projectA._id);
      expect(received.message.content).toBe(
        'Hello Bob! Welcome to the real-time project workspace.'
      );
      expect(received.message.sender.name).toBe('Alice Turing');

      // Verify MongoDB persistence
      const savedInDB = await Message.findOne({ project: projectA._id });
      expect(savedInDB).toBeDefined();
      expect(savedInDB.content).toBe('Hello Bob! Welcome to the real-time project workspace.');

      // Verify REST API retrieves message history
      const restRes = await request(app)
        .get(`/api/projects/${projectA._id}/messages`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(restRes.status).toBe(200);
      expect(restRes.body.data.messages).toHaveLength(1);
      expect(restRes.body.data.messages[0].content).toBe(
        'Hello Bob! Welcome to the real-time project workspace.'
      );

      aliceSocket.disconnect();
      bobSocket.disconnect();
    });

    it('should isolate project rooms so messages are not leaked across projects', async () => {
      const aliceSocket = createSocketClient(aliceToken);
      const bobSocket = createSocketClient(bobToken);

      await Promise.all([
        new Promise((resolve) => aliceSocket.on('connect', resolve)),
        new Promise((resolve) => bobSocket.on('connect', resolve)),
      ]);

      // Alice joins Project B (Private)
      await new Promise((resolve) =>
        aliceSocket.emit('join_project', { projectId: projectB._id }, resolve)
      );

      // Bob joins Project A
      await new Promise((resolve) =>
        bobSocket.emit('join_project', { projectId: projectA._id }, resolve)
      );

      let bobReceivedMessage = false;
      bobSocket.on('new_message', () => {
        bobReceivedMessage = true;
      });

      // Alice sends message in Project B
      await new Promise((resolve) => {
        aliceSocket.emit(
          'send_message',
          {
            projectId: projectB._id,
            content: 'Secret confidential notes for Project Beta.',
          },
          resolve
        );
      });

      // Wait 100ms to verify Bob did not receive it
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(bobReceivedMessage).toBe(false);

      aliceSocket.disconnect();
      bobSocket.disconnect();
    });

    it('should broadcast typing indicators between members', async () => {
      const aliceSocket = createSocketClient(aliceToken);
      const bobSocket = createSocketClient(bobToken);

      await Promise.all([
        new Promise((resolve) => aliceSocket.on('connect', resolve)),
        new Promise((resolve) => bobSocket.on('connect', resolve)),
      ]);

      await Promise.all([
        new Promise((resolve) =>
          aliceSocket.emit('join_project', { projectId: projectA._id }, resolve)
        ),
        new Promise((resolve) =>
          bobSocket.emit('join_project', { projectId: projectA._id }, resolve)
        ),
      ]);

      // Bob listens for user_typing
      const typingPromise = new Promise((resolve) => {
        bobSocket.on('user_typing', (data) => resolve(data));
      });

      aliceSocket.emit('typing_start', { projectId: projectA._id });

      const typingData = await typingPromise;
      expect(typingData.projectId).toBe(projectA._id);
      expect(typingData.user.name).toBe('Alice Turing');

      aliceSocket.disconnect();
      bobSocket.disconnect();
    });
  });
});
