import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('CampusFlow Health & Core API Endpoints', () => {
  it('GET /api/health - should return 200 with operational status and metadata', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'CampusFlow API is running');
    expect(response.body.data).toHaveProperty('service', 'CampusFlow API');
    expect(response.body.data).toHaveProperty('status', 'operational');
    expect(response.body.data).toHaveProperty('environment');
    expect(response.body.data).toHaveProperty('uptimeSeconds');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('database');
  });

  it('GET / - should return 200 with root welcome message', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Welcome to CampusFlow API Server');
  });

  it('GET /api/unmatched-route - should return 404 with standard error format', async () => {
    const response = await request(app).get('/api/unmatched-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('Route not found');
  });
});
