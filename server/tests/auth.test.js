import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { authenticate, authorize } from '../src/middleware/auth.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

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
});

describe('Authentication & Authorization Subsystem (Level 1)', () => {
  const sampleUser = {
    name: 'Alex Johnson',
    email: 'alex.johnson@campusflow.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Computer Science',
    graduationYear: 2026,
    collegeId: 'CF-2026-CS-042',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with 201 status and tokens', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(sampleUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(sampleUser.email.toLowerCase());
      expect(response.body.data.user.name).toBe(sampleUser.name);
      expect(response.body.data.user.role).toBe('student');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');

      // Verify Set-Cookie header contains refreshToken
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);

      // Verify password was hashed in MongoDB
      const savedUser = await User.findOne({ email: sampleUser.email.toLowerCase() }).select('+password');
      expect(savedUser).toBeDefined();
      expect(savedUser.password).not.toBe(sampleUser.password);
      expect(savedUser.password.startsWith('$2')).toBe(true);
    });

    it('should reject registration if email is already registered (409 Conflict)', async () => {
      await request(app).post('/api/auth/register').send(sampleUser);

      const duplicateResponse = await request(app)
        .post('/api/auth/register')
        .send(sampleUser);

      expect(duplicateResponse.status).toBe(409);
      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.message).toContain('already exists');
    });

    it('should reject invalid email format (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...sampleUser, email: 'invalid-email-string' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('should reject weak passwords lacking uppercase, number or symbol (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...sampleUser, password: 'weakpassword' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors.some((e) => e.field === 'password')).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(sampleUser);
    });

    it('should log in an existing user with valid credentials (200 OK)', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: sampleUser.email,
        password: sampleUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(sampleUser.email.toLowerCase());
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject incorrect password (401 Unauthorized)', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: sampleUser.email,
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject unknown email address (401 Unauthorized)', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@campusflow.edu',
        password: 'Password123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/auth/me (Protected Route)', () => {
    let accessToken;

    beforeEach(async () => {
      const reg = await request(app).post('/api/auth/register').send(sampleUser);
      accessToken = reg.body.data.accessToken;
    });

    it('should return user profile when valid Bearer token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(sampleUser.email.toLowerCase());
      expect(response.body.data.user.name).toBe(sampleUser.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject requests without Authorization header (401 Unauthorized)', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No authentication token provided');
    });

    it('should reject invalid or malformed tokens (401 Unauthorized)', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh (Token Rotation)', () => {
    let refreshTokenVal;

    beforeEach(async () => {
      const reg = await request(app).post('/api/auth/register').send(sampleUser);
      refreshTokenVal = reg.body.data.refreshToken;
    });

    it('should exchange a valid refresh token for a new token pair (200 OK)', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshTokenVal });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.refreshToken).not.toBe(refreshTokenVal); // Rotated token
    });

    it('should reject already used / revoked refresh tokens (401 Unauthorized)', async () => {
      // First refresh consumes the token
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshTokenVal });

      // Second refresh with old token must fail
      const reuseResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshTokenVal });

      expect(reuseResponse.status).toBe(401);
      expect(reuseResponse.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let refreshTokenVal;

    beforeEach(async () => {
      const reg = await request(app).post('/api/auth/register').send(sampleUser);
      refreshTokenVal = reg.body.data.refreshToken;
    });

    it('should log out user, invalidate token, and clear cookies (200 OK)', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: refreshTokenVal });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');

      // Attempting to refresh with the logged out token should fail
      const refreshAttempt = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshTokenVal });

      expect(refreshAttempt.status).toBe(401);
    });
  });

  describe('Role-Based Authorization Middleware', () => {
    let studentToken;
    let facultyToken;
    let testApp;

    beforeEach(async () => {
      // Create isolated test app with role test endpoints
      testApp = express();
      testApp.use(express.json());
      testApp.get('/test/admin-only', authenticate, authorize('admin'), (req, res) => {
        res.json({ success: true, message: 'Admin Area' });
      });
      testApp.get('/test/faculty-or-admin', authenticate, authorize('faculty', 'admin'), (req, res) => {
        res.json({ success: true, message: 'Faculty Area' });
      });
      testApp.use(errorHandler);

      // Register student
      const studentRes = await request(app).post('/api/auth/register').send({
        name: 'Student User',
        email: 'student@campusflow.edu',
        password: 'Password123!',
        role: 'student',
      });
      studentToken = studentRes.body.data.accessToken;

      // Register faculty
      const facultyRes = await request(app).post('/api/auth/register').send({
        name: 'Faculty User',
        email: 'faculty@campusflow.edu',
        password: 'Password123!',
        role: 'faculty',
      });
      facultyToken = facultyRes.body.data.accessToken;
    });

    it('should forbid student from accessing admin-only endpoint (403 Forbidden)', async () => {
      const response = await request(testApp)
        .get('/test/admin-only')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Forbidden');
    });

    it('should allow faculty to access faculty-or-admin endpoint (200 OK)', async () => {
      const response = await request(testApp)
        .get('/test/faculty-or-admin')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
