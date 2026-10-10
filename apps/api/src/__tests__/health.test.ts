import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('API Endpoints', () => {
  it('GET /api/v1/health returns 200 with service status and AI model details', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.aiProvider).toBeDefined();
    expect(res.body.model).toBeDefined();
  });

  it('GET /api/v1/users/me rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });
});
