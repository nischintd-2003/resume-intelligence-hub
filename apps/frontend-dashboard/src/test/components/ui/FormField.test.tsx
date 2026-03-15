import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '@/components/ui/FormField';

describe('FormField', () => {
  // Label

  it('renders the label text', () => {
    render(
      <FormField label="Email address" htmlFor="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByText('Email address')).toBeInTheDocument();
  });

  it('associates the label with the input via htmlFor', () => {
    render(
      <FormField label="Email address" htmlFor="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  // Children

  it('renders its children', () => {
    render(
      <FormField label="Name" htmlFor="name">
        <input id="name" placeholder="Enter name" />
      </FormField>,
    );
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  // Error message

  it('renders the error message when error prop is provided', () => {
    render(
      <FormField label="Email" htmlFor="email" error="Invalid email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('renders the error with role="alert" for screen readers', () => {
    render(
      <FormField label="Email" htmlFor="email" error="Required">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does NOT render an error element when error prop is absent', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does NOT render an error element when error is undefined', () => {
    render(
      <FormField label="Email" htmlFor="email" error={undefined}>
        <input id="email" />
      </FormField>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
