import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  // Rendering

  it('renders a visible input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with a placeholder when provided', () => {
    render(<Input placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  // hasError

  it('applies error border class when hasError is true', () => {
    render(<Input hasError />);
    expect(screen.getByRole('textbox')).toHaveClass('border-red-400');
  });

  it('applies default border class when hasError is false', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toHaveClass('border-slate-300');
  });

  // Disabled state

  it('is disabled when the disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  // User interaction

  it('calls onChange when the user types', async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('displays the typed text', async () => {
    render(<Input defaultValue="" />);
    await userEvent.type(screen.getByRole('textbox'), 'typed value');
    expect(screen.getByRole('textbox')).toHaveValue('typed value');
  });

  // Ref forwarding

  it('forwards the ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  // displayName

  it('has a displayName of "Input" for React DevTools', () => {
    expect(Input.displayName).toBe('Input');
  });
});
