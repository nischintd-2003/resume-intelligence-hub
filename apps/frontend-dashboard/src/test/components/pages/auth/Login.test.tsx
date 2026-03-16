import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import toast from 'react-hot-toast';
import RegisterPage from '@/pages/auth/Register';
import { AUTH_COPY } from '@/constants/auth.constants';

//  Module mocks

vi.mock('@/hooks/useAuth', () => ({
  useRegister: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { useRegister } from '@/hooks/useAuth';

//  Helpers

function makeRegisterMock(overrides: Partial<ReturnType<typeof useRegister>> = {}) {
  return {
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useRegister>;
}

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillAndSubmit(mutate: ReturnType<typeof vi.fn>) {
  await userEvent.type(screen.getByLabelText(AUTH_COPY.FIELDS.USERNAME), 'john_doe');
  await userEvent.type(screen.getByLabelText(AUTH_COPY.FIELDS.EMAIL), 'john@example.com');
  await userEvent.type(screen.getByLabelText(AUTH_COPY.FIELDS.PASSWORD), 'password123');
  await userEvent.type(screen.getByLabelText(AUTH_COPY.FIELDS.CONFIRM_PASSWORD), 'password123');
  await userEvent.click(screen.getByRole('button', { name: AUTH_COPY.REGISTER.SUBMIT }));
  return mutate.mock.calls[0][1] as Record<string, unknown>;
}

//  Rendering

describe('RegisterPage — rendering', () => {
  beforeEach(() => {
    vi.mocked(useRegister).mockReturnValue(makeRegisterMock());
  });

  it('sets the document title', () => {
    renderRegister();
    expect(document.title).toBe(AUTH_COPY.REGISTER.PAGE_TITLE);
  });

  it('renders the heading', () => {
    renderRegister();
    expect(screen.getByRole('heading', { name: AUTH_COPY.REGISTER.HEADING })).toBeInTheDocument();
  });

  it('renders all four fields', () => {
    renderRegister();
    expect(screen.getByLabelText(AUTH_COPY.FIELDS.USERNAME)).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_COPY.FIELDS.EMAIL)).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_COPY.FIELDS.PASSWORD)).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_COPY.FIELDS.CONFIRM_PASSWORD)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: AUTH_COPY.REGISTER.SUBMIT })).toBeInTheDocument();
  });

  it('renders a link back to the login page', () => {
    renderRegister();
    expect(screen.getByRole('link', { name: AUTH_COPY.REGISTER.LOGIN_LINK })).toBeInTheDocument();
  });
});

// Field validation

describe('RegisterPage — field validation', () => {
  beforeEach(() => {
    vi.mocked(useRegister).mockReturnValue(makeRegisterMock());
  });

  it('shows errors when all fields are empty and form is submitted', async () => {
    renderRegister();
    await userEvent.click(screen.getByRole('button', { name: AUTH_COPY.REGISTER.SUBMIT }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('shows errors when username is too short and other fields are empty', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(AUTH_COPY.FIELDS.USERNAME), 'ab');
    await userEvent.click(screen.getByRole('button', { name: AUTH_COPY.REGISTER.SUBMIT }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('shows only a confirmPassword error when passwords do not match', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(AUTH_COPY.FIELDS.USERNAME), 'john_doe');
    await userEvent.type(screen.getByLabelText(AUTH_COPY.FIELDS.EMAIL), 'john@example.com');
    await userEvent.type(screen.getByLabelText(AUTH_COPY.FIELDS.PASSWORD), 'password123');
    await userEvent.type(screen.getByLabelText(AUTH_COPY.FIELDS.CONFIRM_PASSWORD), 'different');
    await userEvent.click(screen.getByRole('button', { name: AUTH_COPY.REGISTER.SUBMIT }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('does NOT call registerMutate when validation fails', async () => {
    const mutate = vi.fn();
    vi.mocked(useRegister).mockReturnValue(makeRegisterMock({ mutate }));
    renderRegister();
    await userEvent.click(screen.getByRole('button', { name: AUTH_COPY.REGISTER.SUBMIT }));
    expect(mutate).not.toHaveBeenCalled();
  });
});

//  Submission

describe('RegisterPage — submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls registerMutate with the correct payload', async () => {
    const mutate = vi.fn();
    vi.mocked(useRegister).mockReturnValue(makeRegisterMock({ mutate }));
    renderRegister();
    await fillAndSubmit(mutate);

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('shows the submitting label and disables button while isPending', () => {
    vi.mocked(useRegister).mockReturnValue(makeRegisterMock({ isPending: true }));
    renderRegister();
    expect(screen.getByRole('button', { name: AUTH_COPY.REGISTER.SUBMITTING })).toBeDisabled();
  });

  it('fires toast.error when registerMutate calls onError', async () => {
    const mutate = vi.fn();
    vi.mocked(useRegister).mockReturnValue(makeRegisterMock({ mutate }));
    renderRegister();

    const options = await fillAndSubmit(mutate);

    if (typeof options?.onError !== 'function') {
      throw new Error(
        'Register.tsx must pass onError to registerMutate — ' +
          'e.g. onError: (err) => toast.error(getApiErrorMessage(err))',
      );
    }

    await act(async () => {
      (options.onError as (err: Error) => void)(new Error('Email already registered'));
    });

    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('navigates to /dashboard on successful registration', async () => {
    const mutate = vi.fn();
    vi.mocked(useRegister).mockReturnValue(makeRegisterMock({ mutate }));
    renderRegister();

    const options = await fillAndSubmit(mutate);

    await act(async () => {
      (options.onSuccess as () => void)();
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
