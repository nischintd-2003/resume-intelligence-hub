import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/services/auth.service';
import { api } from '@/services/api';
import { AUTH_STORAGE_KEYS } from '@/constants/auth.constants';
import type { AuthResponseDTO } from '@/types/auth.types';

vi.mock('@/services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockAuthResponse: AuthResponseDTO = {
  user: { id: 'u1', username: 'testuser', email: 'test@example.com' },
  token: 'jwt-token-123',
};

describe('authService.login', () => {
  it('posts credentials and returns the unwrapped AuthResponseDTO', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { status: 'success', data: mockAuthResponse },
    });

    const result = await authService.login({ email: 'test@example.com', password: 'pass123' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(result).toEqual(mockAuthResponse);
  });

  it('propagates errors from the API', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Network error'));
    await expect(authService.login({ email: 'x@x.com', password: '123456' })).rejects.toThrow(
      'Network error',
    );
  });
});

describe('authService.register', () => {
  it('posts user data and returns the unwrapped AuthResponseDTO', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { status: 'success', data: mockAuthResponse },
    });

    const result = await authService.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'pass123',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(result).toEqual(mockAuthResponse);
  });
});

describe('authService.logout', () => {
  beforeEach(() => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'some-token');
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, '{"id":"1"}');
  });

  it('removes the token from localStorage', () => {
    authService.logout();
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)).toBeNull();
  });

  it('removes the user from localStorage', () => {
    authService.logout();
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.USER)).toBeNull();
  });
});
