import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('API Endpoints', () => {
  it('GET /api/v1/health reports database readiness and AI model details', async () => {
    const res = await request(app).get('/api/v1/health');
    expect([200, 503]).toContain(res.status);
    expect(['healthy', 'degraded']).toContain(res.body.status);
    expect(['connected', 'unavailable']).toContain(res.body.database);
    expect(res.body.aiProvider).toBeDefined();
    expect(res.body.model).toBeDefined();
  });

  it('GET /api/v1/health/live confirms that the HTTP process is serving requests', async () => {
    const res = await request(app).get('/api/v1/health/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('alive');
  });

  it('GET /api/v1/users/me rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });
});
