import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';
import * as jobRepo from '../job.repository';
import { config } from '@resume-hub/config';

vi.mock('../job.repository');

describe('Job Module Integration', () => {
  const mockUserId = 'user-123';
  const mockJobId = 'job-456';
  const validToken = jwt.sign({ id: mockUserId }, config.jwt.secret, { expiresIn: '1h' });

  const mockJob = {
    id: mockJobId,
    userId: mockUserId,
    title: 'Senior Frontend Engineer',
    requiredSkills: ['React', 'TypeScript', 'Node.js'],
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/jobs', () => {
    it('should reject invalid payloads (Zod Validation)', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'SE' }); // Missing requiredSkills, title too short

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should create a job record successfully', async () => {
      vi.mocked(jobRepo.createJobRecord).mockResolvedValue(mockJob as any);

      const payload = {
        title: 'Senior Frontend Engineer',
        requiredSkills: ['React', 'TypeScript'],
      };
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(payload.title);
      expect(jobRepo.createJobRecord).toHaveBeenCalledWith(mockUserId, payload);
    });
  });

  describe('GET /api/jobs', () => {
    it('should return a list of jobs for the authenticated user', async () => {
      vi.mocked(jobRepo.findJobsByUser).mockResolvedValue([mockJob] as any[]);

      const response = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBe(mockJobId);
    });
  });

  describe('PATCH /api/jobs/:id', () => {
    it('should update the job if it belongs to the user', async () => {
      vi.mocked(jobRepo.updateJobRecord).mockResolvedValue({ ...mockJob, isActive: false } as any);

      const response = await request(app)
        .patch(`/api/jobs/${mockJobId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(jobRepo.updateJobRecord).toHaveBeenCalledWith(mockUserId, mockJobId, {
        isActive: false,
      });
    });

    it('should return 404 if job does not exist or belongs to someone else (IDOR Protection)', async () => {
      vi.mocked(jobRepo.updateJobRecord).mockResolvedValue(null as any);

      const response = await request(app)
        .patch('/api/jobs/foreign-id-999')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    it('should delete the job and return 204 No Content', async () => {
      vi.mocked(jobRepo.deleteJobRecord).mockResolvedValue(1);

      const response = await request(app)
        .delete(`/api/jobs/${mockJobId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(jobRepo.deleteJobRecord).toHaveBeenCalledWith(mockUserId, mockJobId);
    });

    it('should return 404 if job does not exist or belongs to someone else (IDOR Protection)', async () => {
      vi.mocked(jobRepo.deleteJobRecord).mockResolvedValue(0);

      const response = await request(app)
        .delete('/api/jobs/foreign-id-999')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });
  });
});
