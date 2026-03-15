import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useJobs, useCreateJob, useToggleJob, useDeleteJob } from '@/hooks/useJobs';
import { jobService } from '@/services/job.service';
import { createQueryWrapper } from '../queryWrapper';
import type { JobDTO } from '@/types/job.types';

vi.mock('@/services/job.service', () => ({
  jobService: {
    getAll: vi.fn(),
    create: vi.fn(),
    toggle: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockJob: JobDTO = {
  id: 'job-1',
  title: 'Frontend Engineer',
  requiredSkills: ['React', 'TypeScript'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
};

const JOBS_LIST_KEY = ['jobs', 'list'];

// useJobs

describe('useJobs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns jobs from the service on success', async () => {
    vi.mocked(jobService.getAll).mockResolvedValueOnce([mockJob]);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useJobs(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockJob]);
  });

  it('surfaces the error state when getAll rejects', async () => {
    vi.mocked(jobService.getAll).mockRejectedValueOnce(new Error('Server down'));

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useJobs(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('starts in loading state before the request resolves', () => {
    vi.mocked(jobService.getAll).mockReturnValue(new Promise(() => {}));

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useJobs(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});

// useCreateJob

describe('useCreateJob', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls jobService.create with the input and returns the new job', async () => {
    vi.mocked(jobService.create).mockResolvedValueOnce(mockJob);
    vi.mocked(jobService.getAll).mockResolvedValue([mockJob]);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCreateJob(), { wrapper });

    act(() => {
      result.current.mutate({ title: 'Frontend Engineer', requiredSkills: ['React'] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(jobService.create).toHaveBeenCalledWith({
      title: 'Frontend Engineer',
      requiredSkills: ['React'],
    });
    expect(result.current.data).toEqual(mockJob);
  });

  it('surfaces the error state when create rejects', async () => {
    vi.mocked(jobService.create).mockRejectedValueOnce(new Error('Validation failed'));

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCreateJob(), { wrapper });

    act(() => {
      result.current.mutate({ title: 'X', requiredSkills: [] });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

//  useToggleJob

describe('useToggleJob', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls jobService.toggle with the correct id and isActive', async () => {
    const toggled = { ...mockJob, isActive: false };
    vi.mocked(jobService.toggle).mockResolvedValueOnce(toggled);
    vi.mocked(jobService.getAll).mockResolvedValue([toggled]);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useToggleJob(), { wrapper });

    act(() => {
      result.current.mutate({ id: 'job-1', isActive: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(jobService.toggle).toHaveBeenCalledWith({ id: 'job-1', isActive: false });
  });

  it('applies optimistic update before the server responds', async () => {
    vi.mocked(jobService.getAll).mockResolvedValue([mockJob]);

    let resolveToggle!: (v: JobDTO) => void;
    vi.mocked(jobService.toggle).mockReturnValue(
      new Promise<JobDTO>((res) => {
        resolveToggle = res;
      }),
    );

    const { wrapper, queryClient } = createQueryWrapper();

    const { result } = renderHook(() => ({ jobs: useJobs(), toggle: useToggleJob() }), { wrapper });

    await waitFor(() => expect(result.current.jobs.isSuccess).toBe(true));
    expect(queryClient.getQueryData<JobDTO[]>(JOBS_LIST_KEY)?.[0].isActive).toBe(true);

    act(() => {
      result.current.toggle.mutate({ id: 'job-1', isActive: false });
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<JobDTO[]>(JOBS_LIST_KEY);
      expect(cached?.[0].isActive).toBe(false);
    });

    act(() => resolveToggle({ ...mockJob, isActive: false }));
    await waitFor(() => expect(result.current.toggle.isSuccess).toBe(true));
  });

  it('rolls back the optimistic update when the server rejects', async () => {
    vi.mocked(jobService.getAll).mockResolvedValue([mockJob]);
    vi.mocked(jobService.toggle).mockRejectedValueOnce(new Error('Failed'));

    const { wrapper, queryClient } = createQueryWrapper();

    const { result } = renderHook(() => ({ jobs: useJobs(), toggle: useToggleJob() }), { wrapper });

    await waitFor(() => expect(result.current.jobs.isSuccess).toBe(true));

    act(() => {
      result.current.toggle.mutate({ id: 'job-1', isActive: false });
    });

    await waitFor(() => expect(result.current.toggle.isError).toBe(true));

    const cached = queryClient.getQueryData<JobDTO[]>(JOBS_LIST_KEY);
    expect(cached?.[0].isActive).toBe(true);
  });
});

//  useDeleteJob

describe('useDeleteJob', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls jobService.delete with the job id', async () => {
    vi.mocked(jobService.delete).mockResolvedValueOnce(undefined);
    vi.mocked(jobService.getAll).mockResolvedValue([]);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDeleteJob(), { wrapper });

    act(() => {
      result.current.mutate('job-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(jobService.delete).toHaveBeenCalledWith('job-1');
  });
});
