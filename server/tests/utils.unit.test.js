import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { ApiError } from '../src/utils/apiError.js';
import { sendSuccess } from '../src/utils/apiResponse.js';
import { User } from '../src/models/User.js';
import { config } from '../src/config/env.js';

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

describe('Unit Tests: Core Utilities & Model Methods (Level 12)', () => {
  describe('ApiError Utility', () => {
    it('should create badRequest ApiError (400)', () => {
      const err = ApiError.badRequest('Invalid parameter format');
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Invalid parameter format');
      expect(err.isOperational).toBe(true);
    });

    it('should create unauthorized ApiError (401)', () => {
      const err = ApiError.unauthorized('Token expired');
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Token expired');
    });

    it('should create forbidden ApiError (403)', () => {
      const err = ApiError.forbidden('Admin role required');
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('Admin role required');
    });

    it('should create notFound ApiError (404)', () => {
      const err = ApiError.notFound('Resource not found');
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Resource not found');
    });

    it('should create conflict ApiError (409)', () => {
      const err = ApiError.conflict('Duplicate key error');
      expect(err.statusCode).toBe(409);
      expect(err.message).toBe('Duplicate key error');
    });
  });

  describe('ApiResponse Utility', () => {
    it('should format standard JSON response via sendSuccess', () => {
      let responseBody = null;
      let statusCode = null;

      const mockRes = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(payload) {
          responseBody = payload;
          return this;
        },
      };

      sendSuccess(mockRes, 'Operation successful', { key: 'value' }, 201);

      expect(statusCode).toBe(201);
      expect(responseBody.success).toBe(true);
      expect(responseBody.message).toBe('Operation successful');
      expect(responseBody.data).toEqual({ key: 'value' });
    });
  });

  describe('User Model Methods & Cryptography', () => {
    it('should automatically hash password before saving and verify match', async () => {
      const user = await User.create({
        name: 'Linus Torvalds',
        email: 'linus@campusflow.edu',
        password: 'GitPassword123!',
        role: 'student',
      });

      expect(user.password).not.toBe('GitPassword123!');
      expect(user.password.startsWith('$2')).toBe(true);

      const isValid = await user.comparePassword('GitPassword123!');
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('WrongPassword');
      expect(isInvalid).toBe(false);
    });

    it('should generate valid JWT access token and refresh token', async () => {
      const user = await User.create({
        name: 'Linus Torvalds',
        email: 'linus2@campusflow.edu',
        password: 'GitPassword123!',
        role: 'student',
      });

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');

      const decoded = jwt.verify(accessToken, config.jwtSecret);
      expect(decoded.id).toBe(user._id.toString());
      expect(decoded.role).toBe('student');
    });
  });
});
