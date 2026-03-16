import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resumeService } from '@/services/resume.service';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { ResumeDTO, MatchResultDTO } from '@/types/resume.types';

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const mockResume: ResumeDTO = {
  id: 'r1',
  minioPath: 'files/abc123',
  status: 'uploaded',
  extractedData: null,
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockMatch: MatchResultDTO = {
  id: 'm1',
  resumeId: 'r1',
  jobId: 'j1',
  score: 80,
  details: { matchedSkills: ['React'], missingSkills: ['Go'] },
  jobRole: { id: 'j1', title: 'Frontend Engineer', isActive: true },
};

const mockMeta = {
  totalItems: 1,
  itemCount: 1,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
};

describe('resumeService.register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('posts the minioPath and returns the created resume record', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: mockResume } });

    const result = await resumeService.register('files/abc123');

    expect(api.post).toHaveBeenCalledWith(API_ENDPOINTS.RESUMES.BASE, {
      minioPath: 'files/abc123',
    });
    expect(result).toEqual(mockResume);
  });
});

describe('resumeService.getPaginated', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls GET /resumes with page and limit params', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { data: [mockResume], meta: mockMeta },
    });

    const result = await resumeService.getPaginated(2, 5);

    expect(api.get).toHaveBeenCalledWith(
      API_ENDPOINTS.RESUMES.BASE,
      expect.objectContaining({ params: { page: 2, limit: 5 }, signal: undefined }),
    );
    expect(result.data).toEqual([mockResume]);
    expect(result.meta.currentPage).toBe(1);
  });

  it('defaults to page 1 and limit 10', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { data: [], meta: mockMeta },
    });

    await resumeService.getPaginated();

    expect(api.get).toHaveBeenCalledWith(
      API_ENDPOINTS.RESUMES.BASE,
      expect.objectContaining({ params: { page: 1, limit: 10 } }),
    );
  });
});

describe('resumeService.getById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls GET /resumes/:id and returns the resume', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockResume } });

    const result = await resumeService.getById('r1');

    expect(api.get).toHaveBeenCalledWith(
      `${API_ENDPOINTS.RESUMES.BASE}/r1`,
      expect.objectContaining({ signal: undefined }),
    );
    expect(result).toEqual(mockResume);
  });
});

describe('resumeService.getMatches', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls GET /resumes/:id/matches and returns the match array', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [mockMatch] } });

    const result = await resumeService.getMatches('r1');

    expect(api.get).toHaveBeenCalledWith(
      `${API_ENDPOINTS.RESUMES.BASE}/r1/matches`,
      expect.objectContaining({ signal: undefined }),
    );
    expect(result).toEqual([mockMatch]);
  });

  it('returns an empty array when there are no matches', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } });
    expect(await resumeService.getMatches('r1')).toEqual([]);
  });
});
