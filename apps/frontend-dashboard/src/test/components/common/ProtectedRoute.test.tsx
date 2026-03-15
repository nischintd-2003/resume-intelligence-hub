import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

import { useAuthContext } from '@/contexts/AuthContext';

// Helper

function renderWithRouter(isAuthenticated: boolean) {
  vi.mocked(useAuthContext).mockReturnValue({
    user: isAuthenticated ? { id: 'u1', username: 'alice', email: 'alice@example.com' } : null,
    isAuthenticated,
    isValidating: false,
    login: vi.fn(),
    logout: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

// Tests

describe('ProtectedRoute', () => {
  it('renders children when the user is authenticated', () => {
    renderWithRouter(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when the user is not authenticated', () => {
    renderWithRouter(false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('does not render the login page when authenticated', () => {
    renderWithRouter(true);
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('renders the PageLoader while isValidating is true', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isValidating: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
