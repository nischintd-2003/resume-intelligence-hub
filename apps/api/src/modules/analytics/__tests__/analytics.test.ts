import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';
import { analyticsRepository } from '../analytics.repository';
import { config } from '@resume-hub/config';

vi.mock('../analytics.repository');

describe('Analytics Module Integration', () => {
  const mockUserId = 'user-123';
  const validToken = jwt.sign({ id: mockUserId }, config.jwt.secret, { expiresIn: '1h' });

  const mockAnalytics = {
    id: 'analytics-456',
    userId: mockUserId,
    totalResumes: 5,
    topSkills: [{ skill: 'react', count: 3 }],
    topUniversities: [{ university: 'Silicon University', count: 1 }],
    matchAverages: [{ jobTitle: 'iOS Engineer', averageScore: 85 }],
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return 401 without a valid token', async () => {
      const response = await request(app).get('/api/analytics/dashboard');
      expect(response.status).toBe(401);
    });

    it('should return a blank slate if no analytics exist for the user', async () => {
      vi.mocked(analyticsRepository.findDashboardByUserId).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalResumes).toBe(0);
      expect(response.body.data.topSkills).toEqual([]);
    });

    it('should return the user dashboard analytics', async () => {
      vi.mocked(analyticsRepository.findDashboardByUserId).mockResolvedValue(mockAnalytics as any);

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalResumes).toBe(5);
      expect(response.body.data.topSkills[0].skill).toBe('react');
      expect(response.body.data.matchAverages[0].jobTitle).toBe('iOS Engineer');
    });
  });
});
