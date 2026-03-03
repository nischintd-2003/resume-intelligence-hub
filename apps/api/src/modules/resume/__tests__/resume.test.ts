import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';
import * as resumeRepo from '../resume.repository';
import { config } from '@resume-hub/config';

// Intercept the database
vi.mock('../resume.repository');

describe('Resume Module Integration', () => {
  const mockUserId = 'user-123';
  const mockResumeId = 'resume-456';
  const validToken = jwt.sign({ id: mockUserId }, config.jwt.secret, { expiresIn: '1h' });

  const mockResume = {
    id: mockResumeId,
    userId: mockUserId,
    minioPath: 'files/test.pdf',
    status: 'uploaded',
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Security & Middleware', () => {
    it('should block requests without a token', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send({ minioPath: 'files/test.pdf' });
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Authentication required');
    });

    it('should block requests with a fake/invalid token', async () => {
      const response = await request(app)
        .get('/api/resumes')
        .set('Authorization', 'Bearer fake.jwt.token');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/resumes', () => {
    it('should reject invalid payloads (Zod Validation)', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${validToken}`)
        .send({}); // Missing minioPath

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should create a resume record successfully', async () => {
      vi.mocked(resumeRepo.createResumeRecord).mockResolvedValue(mockResume as any);

      const response = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ minioPath: 'files/test.pdf' });

      expect(response.status).toBe(201);
      expect(response.body.data.minioPath).toBe('files/test.pdf');

      // Prove that the exact user ID from the token was passed to the DB layer
      expect(resumeRepo.createResumeRecord).toHaveBeenCalledWith(mockUserId, 'files/test.pdf');
    });
  });

  describe('GET /api/resumes', () => {
    it('should return a list of resumes for the authenticated user', async () => {
      vi.mocked(resumeRepo.findResumesByUser).mockResolvedValue([mockResume] as any[]);

      const response = await request(app)
        .get('/api/resumes')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].id).toBe(mockResumeId);
    });
  });

  describe('GET /api/resumes/:id', () => {
    it('should return 404 if resume does not exist or belongs to someone else', async () => {
      // Mock the DB returning null (simulating a foreign ID or non-existent record)
      vi.mocked(resumeRepo.findResumeByIdAndUser).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/resumes/foreign-id-999')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Resume not found or access denied');
    });

    it('should return the resume if it belongs to the user', async () => {
      vi.mocked(resumeRepo.findResumeByIdAndUser).mockResolvedValue(mockResume as any);

      const response = await request(app)
        .get(`/api/resumes/${mockResumeId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(mockResumeId);
    });
  });

  describe('GET /api/resumes/:id/matches', () => {
    it('should return 404 if resume does not exist or belongs to someone else', async () => {
      vi.mocked(resumeRepo.findResumeByIdAndUser).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/resumes/foreign-id-999/matches')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Resume not found or access denied');
    });

    it('should return the match results if the resume belongs to the user', async () => {
      vi.mocked(resumeRepo.findResumeByIdAndUser).mockResolvedValue(mockResume as any);

      const mockMatches = [
        {
          id: 'match-123',
          score: 60,
          jobRole: { title: 'iOS Engineer' },
        },
      ];
      vi.mocked(resumeRepo.findMatchesByResumeId).mockResolvedValue(mockMatches as any[]);

      const response = await request(app)
        .get(`/api/resumes/${mockResumeId}/matches`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].score).toBe(60);
      expect(response.body.data[0].jobRole.title).toBe('iOS Engineer');
    });
  });
});
