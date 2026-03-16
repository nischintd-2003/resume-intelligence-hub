import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { AUTH_COPY } from '@/constants/auth.constants';

describe('PasswordInput', () => {
  // Initial render

  it('renders as type="password" by default (text is hidden)', () => {
    render(<PasswordInput />);
    const input = document.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('shows the "Show password" aria-label on the toggle button initially', () => {
    render(<PasswordInput />);
    expect(
      screen.getByRole('button', { name: AUTH_COPY.FIELDS.SHOW_PASSWORD }),
    ).toBeInTheDocument();
  });

  // Toggle visibility

  it('switches to type="text" when the toggle is clicked', async () => {
    render(<PasswordInput />);
    await userEvent.click(screen.getByRole('button', { name: AUTH_COPY.FIELDS.SHOW_PASSWORD }));
    expect(document.querySelector('input')).toHaveAttribute('type', 'text');
  });

  it('updates the aria-label to "Hide password" after reveal', async () => {
    render(<PasswordInput />);
    await userEvent.click(screen.getByRole('button', { name: AUTH_COPY.FIELDS.SHOW_PASSWORD }));
    expect(
      screen.getByRole('button', { name: AUTH_COPY.FIELDS.HIDE_PASSWORD }),
    ).toBeInTheDocument();
  });

  it('toggles back to type="password" on a second click', async () => {
    render(<PasswordInput />);
    const btn = screen.getByRole('button', { name: AUTH_COPY.FIELDS.SHOW_PASSWORD });
    await userEvent.click(btn);
    await userEvent.click(screen.getByRole('button', { name: AUTH_COPY.FIELDS.HIDE_PASSWORD }));
    expect(document.querySelector('input')).toHaveAttribute('type', 'password');
  });

  // hasError forwarding

  it('forwards hasError to the inner Input (adds error border class)', () => {
    render(<PasswordInput hasError />);
    expect(document.querySelector('input')).toHaveClass('border-red-400');
  });

  it('does not add the error border class when hasError is false', () => {
    render(<PasswordInput />);
    expect(document.querySelector('input')).not.toHaveClass('border-red-400');
  });

  //  Ref forwarding

  it('forwards the ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  // displayName

  it('has a displayName of "PasswordInput"', () => {
    expect(PasswordInput.displayName).toBe('PasswordInput');
  });
});
