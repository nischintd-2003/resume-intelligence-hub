import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { authRepository } from '../auth.repository';
import bcrypt from 'bcrypt';

vi.mock('../auth.repository');
vi.mock('bcrypt');

describe('Auth Module Integration', () => {
  const mockUser = {
    id: 'uuid-1234',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    getDataValue: vi.fn().mockReturnValue('hashed_password'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should reject invalid payloads (Zod Validation)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should register a new user successfully', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never);

      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 409 if email is already registered', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser as any);

      const response = await request(app).post('/api/auth/register').send({
        username: 'newuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email is already registered');
    });
  });
});
