import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import * as authRepo from '../auth.repository';
import bcrypt from 'bcrypt';

// Intercept the repository and bcrypt
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
      // Mock the DB returning null (user does not exist)
      vi.mocked(authRepo.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepo.findUserByUsername).mockResolvedValue(null);
      // Mock the DB creating a user
      vi.mocked(authRepo.createUser).mockResolvedValue(mockUser as any);
      // Mock bcrypt
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
      // Mock the DB finding an existing user
      vi.mocked(authRepo.findUserByEmail).mockResolvedValue(mockUser as any);

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
