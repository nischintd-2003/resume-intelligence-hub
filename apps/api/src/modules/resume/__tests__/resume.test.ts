import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';
import { resumeRepository } from '../resume.repository';
import { ocrQueue } from '@resume-hub/queue-lib';
import { config } from '@resume-hub/config';

vi.mock('../resume.repository');
vi.mock('@resume-hub/queue-lib', () => ({
  ocrQueue: {
    add: vi.fn(),
  },
  redisConnection: { status: 'ready' },
}));

type RepoResume = NonNullable<Awaited<ReturnType<typeof resumeRepository.findResumeByIdAndUser>>>;
type RepoResumesPaginated = Awaited<ReturnType<typeof resumeRepository.findResumesByUser>>;
type RepoMatches = Awaited<ReturnType<typeof resumeRepository.findMatchesByResumeId>>;

describe('Resume Module Integration', () => {
  const mockUserId = '111e8400-e29b-41d4-a716-446655441111';
  const mockResumeId = '222e8400-e29b-41d4-a716-446655442222';
  const validToken = jwt.sign({ id: mockUserId }, config.jwt.secret, { expiresIn: '1h' });

  const mockResume = {
    id: mockResumeId,
    userId: mockUserId,
    minioPath: 'resumes/john-doe-resume.pdf',
    status: 'uploaded',
    extractedData: null,
    createdAt: new Date(),
  } as unknown as RepoResume;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Security & Middleware', () => {
    it('should block requests without a valid token', async () => {
      const response = await request(app)
        .post('/api/v1/resumes')
        .send({ minioPath: 'resumes/test.pdf' });
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/resumes', () => {
    it('should reject invalid paths based on Zod Regex Validation', async () => {
      const response = await request(app)
        .post('/api/v1/resumes')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ minioPath: 'wrong-folder/test.pdf' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should create a resume record and enqueue to ocrQueue successfully', async () => {
      vi.mocked(resumeRepository.createResumeRecord).mockResolvedValue(mockResume);
      vi.mocked(ocrQueue.add).mockResolvedValue({ id: 'job-123' } as any);

      const payload = { minioPath: 'resumes/john-doe-resume.pdf' };
      const response = await request(app)
        .post('/api/v1/resumes')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.minioPath).toBe(payload.minioPath);
      expect(resumeRepository.createResumeRecord).toHaveBeenCalledWith(
        mockUserId,
        payload.minioPath,
      );
      expect(ocrQueue.add).toHaveBeenCalledWith(
        'extract-text',
        {
          resumeId: mockResume.id,
          userId: mockUserId,
          minioPath: mockResume.minioPath,
        },
        expect.any(Object),
      );
    });

    it('CRITICAL: should catch queue failure, update status to failed, and return 500', async () => {
      vi.mocked(resumeRepository.createResumeRecord).mockResolvedValue(mockResume);
      vi.mocked(ocrQueue.add).mockRejectedValue(new Error('Redis connection lost'));
      vi.mocked(resumeRepository.updateResumeStatus).mockResolvedValue([1] as any);

      const response = await request(app)
        .post('/api/v1/resumes')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ minioPath: 'resumes/john-doe-resume.pdf' });

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('could not be queued');
      expect(resumeRepository.updateResumeStatus).toHaveBeenCalledWith(mockResume.id, 'failed');
    });
  });

  describe('GET /api/v1/resumes', () => {
    it('should return a paginated list of resumes for the user', async () => {
      const mockPaginatedResponse: RepoResumesPaginated = {
        rows: [mockResume],
        count: 1,
      };
      vi.mocked(resumeRepository.findResumesByUser).mockResolvedValue(mockPaginatedResponse);

      const response = await request(app)
        .get('/api/v1/resumes?page=1&limit=10')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBe(mockResumeId);
      expect(response.body.meta.totalItems).toBe(1);
    });
  });

  describe('GET /api/v1/resumes/:id', () => {
    it('should return 404 if resume belongs to someone else (IDOR Protection)', async () => {
      vi.mocked(resumeRepository.findResumeByIdAndUser).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/resumes/999e8400-e29b-41d4-a716-446655449999')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should return the resume if it belongs to the authenticated user', async () => {
      vi.mocked(resumeRepository.findResumeByIdAndUser).mockResolvedValue(mockResume);

      const response = await request(app)
        .get(`/api/v1/resumes/${mockResumeId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(mockResumeId);
    });
  });

  describe('GET /api/v1/resumes/:id/matches', () => {
    it('should return 404 if base resume does not exist/belong to user', async () => {
      vi.mocked(resumeRepository.findResumeByIdAndUser).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/resumes/999e8400-e29b-41d4-a716-446655449999/matches')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should return the match results successfully', async () => {
      vi.mocked(resumeRepository.findResumeByIdAndUser).mockResolvedValue(mockResume);

      const mockMatches = [
        {
          id: 'match-123',
          resumeId: mockResumeId,
          jobId: 'job-xyz',
          score: 85,
          details: { matchedSkills: ['React'], missingSkills: [] },
          jobRole: { id: 'job-xyz', title: 'iOS Engineer', isActive: true },
        },
      ] as unknown as RepoMatches;

      vi.mocked(resumeRepository.findMatchesByResumeId).mockResolvedValue(mockMatches);

      const response = await request(app)
        .get(`/api/v1/resumes/${mockResumeId}/matches`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].score).toBe(85);
      expect(response.body.data[0].jobRole.title).toBe('iOS Engineer');
    });
  });
});
