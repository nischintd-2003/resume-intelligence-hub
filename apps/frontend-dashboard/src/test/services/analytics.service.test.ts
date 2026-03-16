import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from '@/services/analytics.service';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { DashboardAnalyticsDTO } from '@/types/analytics.types';

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const mockDashboard: DashboardAnalyticsDTO = {
  totalResumes: 5,
  topSkills: [{ skill: 'react', count: 3 }],
  topUniversities: [{ university: 'MIT', count: 2 }],
  matchAverages: [{ jobTitle: 'Frontend Engineer', averageScore: 75 }],
  updatedAt: '2024-06-01T12:00:00.000Z',
};

describe('analyticsService.getDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls GET /analytics/dashboard and returns the dashboard data', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockDashboard } });

    const result = await analyticsService.getDashboard();

    expect(api.get).toHaveBeenCalledWith(
      API_ENDPOINTS.ANALYTICS.DASHBOARD,
      expect.objectContaining({ signal: undefined }),
    );
    expect(result).toEqual(mockDashboard);
  });

  it('propagates errors from the API', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Server error'));
    await expect(analyticsService.getDashboard()).rejects.toThrow('Server error');
  });

  it('returns null updatedAt when no data has been computed yet', async () => {
    const empty = { ...mockDashboard, updatedAt: null, totalResumes: 0 };
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: empty } });

    const result = await analyticsService.getDashboard();
    expect(result.updatedAt).toBeNull();
    expect(result.totalResumes).toBe(0);
  });
});
