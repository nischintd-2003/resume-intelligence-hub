import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AUTH_STORAGE_KEYS } from '@/constants/auth.constants';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import type { AuthResponseDTO } from '@/types/auth.types';

//  Module mocks

vi.mock('@/services/auth.service', () => ({
  authService: { logout: vi.fn() },
}));

vi.mock('@/utils/auth', () => ({
  isTokenExpired: vi.fn(),
}));

import { isTokenExpired } from '@/utils/auth';

// Helper components

function TestConsumer() {
  const { user, isAuthenticated } = useAuthContext();
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.username ?? 'none'}</span>
    </div>
  );
}

function TestActions() {
  const { login, logout } = useAuthContext();
  const mockData: AuthResponseDTO = {
    user: { id: 'u1', username: 'alice', email: 'alice@example.com' },
    token: 'token-abc',
  };
  return (
    <>
      <button onClick={() => login(mockData)}>login</button>
      <button onClick={logout}>logout</button>
    </>
  );
}

//  Initial state

describe('AuthProvider — initial state', () => {
  it('starts unauthenticated when localStorage is empty', () => {
    vi.mocked(isTokenExpired).mockReturnValue(true);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  it('restores session from localStorage when both token and user are present', () => {
    vi.mocked(isTokenExpired).mockReturnValue(false);

    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'stored-token');
    localStorage.setItem(
      AUTH_STORAGE_KEYS.USER,
      JSON.stringify({ id: 'u1', username: 'bob', email: 'bob@example.com' }),
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(screen.getByTestId('username').textContent).toBe('bob');
  });

  it('stays unauthenticated when token is missing even if user is stored', () => {
    vi.mocked(isTokenExpired).mockReturnValue(true);

    localStorage.setItem(
      AUTH_STORAGE_KEYS.USER,
      JSON.stringify({ id: 'u1', username: 'bob', email: 'bob@example.com' }),
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth').textContent).toBe('false');
  });

  it('stays unauthenticated when stored user JSON is malformed', () => {
    vi.mocked(isTokenExpired).mockReturnValue(false);

    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'some-token');
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, '{bad-json}');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth').textContent).toBe('false');
  });
});

// login

describe('AuthProvider — login()', () => {
  beforeEach(() => {
    vi.mocked(isTokenExpired).mockReturnValue(true);

    render(
      <AuthProvider>
        <TestConsumer />
        <TestActions />
      </AuthProvider>,
    );
  });

  it('sets isAuthenticated to true and displays the username', async () => {
    await act(async () => {
      screen.getByText('login').click();
    });

    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(screen.getByTestId('username').textContent).toBe('alice');
  });

  it('writes the token and user to localStorage', async () => {
    await act(async () => {
      screen.getByText('login').click();
    });

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)).toBe('token-abc');
    const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.USER)!);
    expect(stored.username).toBe('alice');
  });
});

//  logout

describe('AuthProvider — logout()', () => {
  it('clears isAuthenticated and removes storage after login then logout', async () => {
    vi.mocked(isTokenExpired).mockReturnValue(true);

    render(
      <AuthProvider>
        <TestConsumer />
        <TestActions />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText('login').click();
    });

    expect(screen.getByTestId('auth').textContent).toBe('true');

    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('none');
  });
});

// unauthorized event

describe('AuthProvider — auth:unauthorized event', () => {
  it('clears the session when the event fires', async () => {
    vi.mocked(isTokenExpired).mockReturnValue(false);

    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'stored-token');
    localStorage.setItem(
      AUTH_STORAGE_KEYS.USER,
      JSON.stringify({ id: 'u1', username: 'bob', email: 'bob@example.com' }),
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth').textContent).toBe('true');

    await act(async () => {
      window.dispatchEvent(new Event('auth:unauthorized'));
    });

    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('none');
  });
});

// useAuthContext guard

describe('useAuthContext', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useAuthContext must be used within <AuthProvider>',
    );

    consoleSpy.mockRestore();
  });
});
