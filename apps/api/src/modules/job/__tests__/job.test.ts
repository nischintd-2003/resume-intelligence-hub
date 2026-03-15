import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';
import { jobRepository } from '../job.repository';
import { matchQueue } from '@resume-hub/queue-lib';
import { config } from '@resume-hub/config';

//  Boundary Mocks
vi.mock('../job.repository');
vi.mock('@resume-hub/queue-lib', () => ({
  matchQueue: {
    add: vi.fn().mockResolvedValue(true),
  },
  redisConnection: { status: 'ready' },
}));

describe('Job Module Integration', () => {
  const mockUserId = 'user-123';
  const mockJobId = '550e8400-e29b-41d4-a716-446655440000';
  const validToken = jwt.sign({ id: mockUserId }, config.jwt.secret, { expiresIn: '1h' });

  const mockJob = {
    id: mockJobId,
    userId: mockUserId,
    title: 'Senior Frontend Engineer',
    requiredSkills: ['React', 'TypeScript', 'Node.js'],
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Security & Validation', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app).post('/api/v1/jobs').send({});
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/jobs', () => {
    const validPayload = {
      title: 'Senior Frontend Engineer',
      requiredSkills: ['React', 'TypeScript'],
    };

    it('should reject invalid payloads (Zod Validation)', async () => {
      const response = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'SE' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.errors).toBeDefined();
    });

    it('should create a job record and enqueue a match calculation', async () => {
      vi.mocked(jobRepository.createJobRecord).mockResolvedValue(mockJob as any);

      const response = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${validToken}`)
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(mockJob.title);
      expect(jobRepository.createJobRecord).toHaveBeenCalledWith(mockUserId, validPayload);

      expect(matchQueue.add).toHaveBeenCalledWith('calculate-match', {
        jobId: mockJob.id,
        userId: mockUserId,
      });
    });
  });

  describe('GET /api/v1/jobs', () => {
    it('should return a list of jobs for the authenticated user', async () => {
      vi.mocked(jobRepository.findJobsByUser).mockResolvedValue([mockJob] as any[]);

      const response = await request(app)
        .get('/api/v1/jobs')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(mockJobId);
      expect(jobRepository.findJobsByUser).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('GET /api/v1/jobs/:id', () => {
    it('should return 404 if job does not exist or belongs to another user', async () => {
      vi.mocked(jobRepository.findJobByIdAndUser).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/jobs/999e8400-e29b-41d4-a716-446655449999')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should return job details successfully', async () => {
      vi.mocked(jobRepository.findJobByIdAndUser).mockResolvedValue(mockJob as any);

      const response = await request(app)
        .get(`/api/v1/jobs/${mockJobId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(mockJobId);
    });
  });

  describe('PATCH /api/v1/jobs/:id', () => {
    it('should update the job and enqueue match calculation if scoring fields change', async () => {
      vi.mocked(jobRepository.updateJobRecord).mockResolvedValue({
        ...mockJob,
        isActive: false,
      } as any);

      const response = await request(app)
        .patch(`/api/v1/jobs/${mockJobId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(jobRepository.updateJobRecord).toHaveBeenCalledWith(mockUserId, mockJobId, {
        isActive: false,
      });

      expect(matchQueue.add).toHaveBeenCalledWith('calculate-match', {
        jobId: mockJobId,
        userId: mockUserId,
      });
    });

    it('should update the job but NOT enqueue match calculation if non-scoring fields change', async () => {
      vi.mocked(jobRepository.updateJobRecord).mockResolvedValue({
        ...mockJob,
        title: 'New Title',
      } as any);

      const response = await request(app)
        .patch(`/api/v1/jobs/${mockJobId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'New Title' });

      expect(response.status).toBe(200);
      expect(matchQueue.add).not.toHaveBeenCalled();
    });

    it('should return 404 if attempting to update an unauthorized job (IDOR)', async () => {
      vi.mocked(jobRepository.updateJobRecord).mockResolvedValue(null as any);

      const response = await request(app)
        .patch('/api/v1/jobs/999e8400-e29b-41d4-a716-446655449999')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/jobs/:id', () => {
    it('should delete the job and return 204', async () => {
      vi.mocked(jobRepository.deleteJobRecord).mockResolvedValue(1);

      const response = await request(app)
        .delete(`/api/v1/jobs/${mockJobId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(204);
      expect(jobRepository.deleteJobRecord).toHaveBeenCalledWith(mockUserId, mockJobId);
    });

    it('should return 404 if attempting to delete an unauthorized job (IDOR)', async () => {
      vi.mocked(jobRepository.deleteJobRecord).mockResolvedValue(0);

      const response = await request(app)
        .delete('/api/v1/jobs/999e8400-e29b-41d4-a716-446655449999')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });
  });
});
