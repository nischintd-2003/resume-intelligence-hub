import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useResumes, useResumeMatches } from '@/hooks/useResumes';
import { resumeService } from '@/services/resume.service';
import { createQueryWrapper } from '../queryWrapper';
import type { ResumeDTO, MatchResultDTO, PaginatedResult } from '@/types/resume.types';

vi.mock('@/services/resume.service', () => ({
  resumeService: {
    getPaginated: vi.fn(),
    getMatches: vi.fn(),
    register: vi.fn(),
    getById: vi.fn(),
  },
}));

const mockResume: ResumeDTO = {
  id: 'r1',
  minioPath: 'files/abc',
  status: 'uploaded',
  extractedData: null,
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockMeta = {
  totalItems: 1,
  itemCount: 1,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
};

const mockPaginated: PaginatedResult<ResumeDTO> = {
  data: [mockResume],
  meta: mockMeta,
};

const mockMatch: MatchResultDTO = {
  id: 'm1',
  resumeId: 'r1',
  jobId: 'j1',
  score: 80,
  details: { matchedSkills: ['React'], missingSkills: ['Go'] },
  jobRole: { id: 'j1', title: 'Frontend Engineer', isActive: true },
};

// useResumes

describe('useResumes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls getPaginated with the provided page and limit', async () => {
    vi.mocked(resumeService.getPaginated).mockResolvedValueOnce(mockPaginated);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useResumes(2, 5), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(resumeService.getPaginated).toHaveBeenCalledWith(
      2,
      5,
      expect.objectContaining({ signal: expect.any(Object) }),
    );
    expect(result.current.data?.data).toEqual([mockResume]);
    expect(result.current.data?.meta.currentPage).toBe(1);
  });

  it('defaults to page 1 and limit 10 when called without arguments', async () => {
    vi.mocked(resumeService.getPaginated).mockResolvedValueOnce(mockPaginated);

    const { wrapper } = createQueryWrapper();
    renderHook(() => useResumes(), { wrapper });

    await waitFor(() =>
      expect(resumeService.getPaginated).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ signal: expect.any(Object) }),
      ),
    );
  });

  it('surfaces the error state when getPaginated rejects', async () => {
    vi.mocked(resumeService.getPaginated).mockRejectedValueOnce(new Error('Network error'));

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useResumes(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('uses a different query key per page so pages are independently cached', async () => {
    vi.mocked(resumeService.getPaginated).mockResolvedValue(mockPaginated);

    const { wrapper, queryClient } = createQueryWrapper();

    renderHook(() => useResumes(1, 10), { wrapper });
    await waitFor(() => expect(queryClient.getQueryData(['resumes', 'list', 1, 10])).toBeDefined());

    renderHook(() => useResumes(2, 10), { wrapper });
    await waitFor(() => expect(queryClient.getQueryData(['resumes', 'list', 2, 10])).toBeDefined());
  });
});

//  useResumeMatches

describe('useResumeMatches', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches matches when resumeId is provided', async () => {
    vi.mocked(resumeService.getMatches).mockResolvedValueOnce([mockMatch]);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useResumeMatches('r1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(resumeService.getMatches).toHaveBeenCalledWith(
      'r1',
      expect.objectContaining({ signal: expect.any(Object) }),
    );
    expect(result.current.data).toEqual([mockMatch]);
  });

  it('does NOT call getMatches when resumeId is null', () => {
    const { wrapper } = createQueryWrapper();
    renderHook(() => useResumeMatches(null), { wrapper });
    expect(resumeService.getMatches).not.toHaveBeenCalled();
  });

  it('has fetchStatus "idle" when resumeId is null (query is disabled)', () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useResumeMatches(null), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('returns an empty array when the server returns no matches', async () => {
    vi.mocked(resumeService.getMatches).mockResolvedValueOnce([]);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useResumeMatches('r1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
