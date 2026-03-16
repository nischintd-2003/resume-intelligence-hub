import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  //  Rendering

  it('renders its children as visible text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders a <button> element by default', () => {
    render(<Button>OK</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Disabled state

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>OK</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled and aria-busy when isLoading is true', () => {
    render(<Button isLoading>OK</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the loading spinner SVG when isLoading is true', () => {
    const { container } = render(<Button isLoading>OK</Button>);
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('does not show the spinner when isLoading is false', () => {
    const { container } = render(<Button>OK</Button>);
    expect(container.querySelector('svg.animate-spin')).not.toBeInTheDocument();
  });

  // Click handler

  it('calls onClick when clicked and not disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when the button is disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Click
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when isLoading is true', async () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Click
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  // fullWidth

  it('adds w-full class when fullWidth is true', () => {
    render(<Button fullWidth>OK</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('does not add w-full class when fullWidth is false', () => {
    render(<Button>OK</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('w-full');
  });

  //  Variants

  it('applies a distinct class for the primary variant by default', () => {
    render(<Button>OK</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('text-white');
  });

  it('applies a border class for the secondary variant', () => {
    render(<Button variant="secondary">OK</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });

  it('does not apply text-white for the ghost variant', () => {
    render(<Button variant="ghost">OK</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('text-white');
  });

  //  Sizes

  it('applies h-10 for the default md size', () => {
    render(<Button>OK</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');
  });

  it('applies h-8 for the sm size', () => {
    render(<Button size="sm">OK</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');
  });

  it('applies h-11 for the lg size', () => {
    render(<Button size="lg">OK</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });

  //  Keyboard navigation

  it('fires onClick when Enter is pressed while focused', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enter test</Button>);
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
