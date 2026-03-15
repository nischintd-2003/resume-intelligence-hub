import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';
import { analyticsRepository } from '../analytics.repository';
import { config } from '@resume-hub/config';

vi.mock('../analytics.repository');
vi.mock('@resume-hub/queue-lib', () => ({
  redisConnection: { status: 'ready' },
}));

type RepoDashboard = NonNullable<
  Awaited<ReturnType<typeof analyticsRepository.findDashboardByUserId>>
>;

describe('Analytics Module Integration', () => {
  const mockUserId = '888e8400-e29b-41d4-a716-446655448888';
  const validToken = jwt.sign({ id: mockUserId }, config.jwt.secret, { expiresIn: '1h' });

  const mockAnalytics = {
    id: '777e8400-e29b-41d4-a716-446655447777',
    userId: mockUserId,
    totalResumes: 5,
    topSkills: [{ skill: 'react', count: 3 }],
    topUniversities: [{ university: 'Silicon University', count: 1 }],
    matchAverages: [{ jobTitle: 'iOS Engineer', averageScore: 85 }],
    updatedAt: new Date(),
  } as RepoDashboard;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return 401 without a valid token', async () => {
      const response = await request(app).get('/api/v1/analytics/dashboard');
      expect(response.status).toBe(401);
    });

    it('should return a zeroed blank slate if no analytics exist for the user', async () => {
      vi.mocked(analyticsRepository.findDashboardByUserId).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalResumes).toBe(0);
      expect(response.body.data.topSkills).toEqual([]);
      expect(response.body.data.matchAverages).toEqual([]);
      expect(response.body.data.updatedAt).toBeNull();
    });

    it('should return the populated user dashboard analytics', async () => {
      vi.mocked(analyticsRepository.findDashboardByUserId).mockResolvedValue(mockAnalytics);

      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalResumes).toBe(5);
      expect(response.body.data.topSkills[0].skill).toBe('react');
      expect(response.body.data.matchAverages[0].jobTitle).toBe('iOS Engineer');
    });
  });
});
