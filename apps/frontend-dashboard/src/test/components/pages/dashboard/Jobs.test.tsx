import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import JobsPage from '@/pages/dashboard/Jobs';
import type { JobDTO } from '@/types/job.types';

vi.mock('@/hooks/useJobs', () => ({
  useJobs: vi.fn(),
  useCreateJob: vi.fn(),
  useDeleteJob: vi.fn(),
  useToggleJob: vi.fn(),
}));

import { useJobs, useCreateJob, useDeleteJob, useToggleJob } from '@/hooks/useJobs';

//  Shared mock data

const mockJob: JobDTO = {
  id: 'job-1',
  title: 'Senior Frontend Engineer',
  requiredSkills: ['react', 'typescript'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
};

function setupMocks(overrides: { jobs?: Partial<ReturnType<typeof useJobs>> } = {}) {
  vi.mocked(useJobs).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides.jobs,
  } as unknown as ReturnType<typeof useJobs>);

  vi.mocked(useCreateJob).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useCreateJob>);

  vi.mocked(useDeleteJob).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteJob>);

  vi.mocked(useToggleJob).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useToggleJob>);
}

function renderJobs() {
  return render(
    <MemoryRouter>
      <JobsPage />
    </MemoryRouter>,
  );
}

//  Loading state

describe('JobsPage — loading', () => {
  it('shows a spinner while jobs are loading', () => {
    setupMocks({ jobs: { isLoading: true } });
    const { container } = renderJobs();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

//  Error state

describe('JobsPage — error', () => {
  it('shows the error message when the request fails', () => {
    setupMocks({ jobs: { isError: true } });
    renderJobs();
    expect(screen.getByText('Failed to load jobs.')).toBeInTheDocument();
  });

  it('calls refetch when "Try again" is clicked', async () => {
    const refetch = vi.fn();
    setupMocks({ jobs: { isError: true, refetch } });
    renderJobs();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

//  Empty state

describe('JobsPage — empty state', () => {
  beforeEach(() => setupMocks());

  it('shows the empty state when there are no jobs', () => {
    renderJobs();
    expect(screen.getByText('No job roles yet')).toBeInTheDocument();
  });

  it('opens the create panel when "Create first job" is clicked', async () => {
    renderJobs();
    await userEvent.click(screen.getByRole('button', { name: /create first job/i }));
    expect(screen.getByPlaceholderText(/senior frontend engineer/i)).toBeInTheDocument();
  });
});

//  With jobs

describe('JobsPage — with jobs', () => {
  beforeEach(() => {
    setupMocks({ jobs: { data: [mockJob] } });
  });

  it('renders the job title', () => {
    renderJobs();
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
  });

  it('renders the skill tags', () => {
    renderJobs();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('shows the job count in the header', () => {
    renderJobs();
    expect(screen.getByText(/1 job role/)).toBeInTheDocument();
  });
});

//  "New job" button & create panel

describe('JobsPage — create panel', () => {
  beforeEach(() => setupMocks());

  it('opens the create panel when "New job" is clicked', async () => {
    renderJobs();
    await userEvent.click(screen.getByRole('button', { name: /new job/i }));
    expect(screen.getByPlaceholderText(/senior frontend engineer/i)).toBeInTheDocument();
  });

  it('closes the create panel when Cancel is clicked', async () => {
    renderJobs();
    await userEvent.click(screen.getByRole('button', { name: /new job/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByPlaceholderText(/senior frontend engineer/i)).not.toBeInTheDocument();
  });

  it('shows a title validation error when the title is too short', async () => {
    renderJobs();
    await userEvent.click(screen.getByRole('button', { name: /new job/i }));
    await userEvent.type(screen.getByPlaceholderText(/senior frontend engineer/i), 'ab');
    await userEvent.click(screen.getByRole('button', { name: /create job/i }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('calls createJob mutate with the correct input', async () => {
    const mutate = vi.fn();
    vi.mocked(useCreateJob).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateJob>);

    renderJobs();
    await userEvent.click(screen.getByRole('button', { name: /new job/i }));

    await userEvent.type(
      screen.getByPlaceholderText(/senior frontend engineer/i),
      'Frontend Engineer',
    );

    await userEvent.type(screen.getByLabelText(/add a required skill/i), 'react');
    await userEvent.keyboard('{Enter}');

    await userEvent.click(screen.getByRole('button', { name: /create job/i }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Frontend Engineer', requiredSkills: ['react'] }),
      expect.any(Object),
    );
  });
});

//  Delete flow

describe('JobsPage — delete', () => {
  beforeEach(() => {
    setupMocks({ jobs: { data: [mockJob] } });
  });

  it('shows the confirm/cancel buttons after clicking the delete icon', async () => {
    renderJobs();
    await userEvent.click(screen.getByRole('button', { name: `Delete ${mockJob.title}` }));
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
  });

  it('calls deleteJob mutate when the confirm delete button is clicked', async () => {
    const mutate = vi.fn();
    vi.mocked(useDeleteJob).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteJob>);

    renderJobs();
    await userEvent.click(screen.getByRole('button', { name: `Delete ${mockJob.title}` }));
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(mutate).toHaveBeenCalledWith(mockJob.id);
  });

  it('hides the confirm buttons when cancel is clicked', async () => {
    renderJobs();
    await userEvent.click(screen.getByRole('button', { name: `Delete ${mockJob.title}` }));
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
    });
  });
});
