import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jobService } from '@/services/job.service';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { JobDTO } from '@/types/job.types';

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const mockJob: JobDTO = {
  id: 'job-1',
  title: 'Senior Engineer',
  requiredSkills: ['React', 'TypeScript'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('jobService.getAll', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls GET /jobs and returns the array of jobs', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [mockJob] } });

    const result = await jobService.getAll();

    expect(api.get).toHaveBeenCalledWith(
      API_ENDPOINTS.JOBS.BASE,
      expect.objectContaining({ signal: undefined }),
    );
    expect(result).toEqual([mockJob]);
  });

  it('returns an empty array when the server returns []', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } });
    expect(await jobService.getAll()).toEqual([]);
  });
});

describe('jobService.create', () => {
  beforeEach(() => vi.clearAllMocks());

  it('posts the input and returns the created job', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: mockJob } });

    const input = { title: 'Senior Engineer', requiredSkills: ['React', 'TypeScript'] };
    const result = await jobService.create(input);

    expect(api.post).toHaveBeenCalledWith(API_ENDPOINTS.JOBS.BASE, input);
    expect(result).toEqual(mockJob);
  });
});

describe('jobService.toggle', () => {
  beforeEach(() => vi.clearAllMocks());

  it('patches isActive and returns the updated job', async () => {
    const toggled = { ...mockJob, isActive: false };
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { data: toggled } });

    const result = await jobService.toggle({ id: 'job-1', isActive: false });

    expect(api.patch).toHaveBeenCalledWith(`${API_ENDPOINTS.JOBS.BASE}/job-1`, {
      isActive: false,
    });
    expect(result.isActive).toBe(false);
  });
});

describe('jobService.delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls DELETE with the job id and resolves without a value', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

    await expect(jobService.delete('job-1')).resolves.toBeUndefined();
    expect(api.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.JOBS.BASE}/job-1`);
  });
});
