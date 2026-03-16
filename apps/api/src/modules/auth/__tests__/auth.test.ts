import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { authRepository } from '../auth.repository';
import bcrypt from 'bcrypt';

vi.mock('../auth.repository');
vi.mock('bcrypt');

type RepoUser = NonNullable<Awaited<ReturnType<typeof authRepository.findUserByEmail>>>;

describe('Auth Module Integration', () => {
  const mockUser = {
    id: 'uuid-1234',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
  } as RepoUser;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should reject invalid payloads (Zod Validation)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should register a new user successfully', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockUser);

      // Strictly type the bcrypt mock
      vi.mocked(bcrypt.hash).mockImplementation(async () => 'hashed_password');

      const response = await request(app).post('/api/v1/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 409 Conflict if email is already registered', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);

      const response = await request(app).post('/api/v1/auth/register').send({
        username: 'newuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email is already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 401 Unauthorized for non-existent email', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'ghost@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 Unauthorized for incorrect password', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(async () => false);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
    });

    it('should login successfully and return a token', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(async () => true);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
