import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AnalyticsPage from '@/pages/dashboard/Analytics';
import type { DashboardAnalyticsDTO } from '@/types/analytics.types';

vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(),
}));

import { useAnalytics } from '@/hooks/useAnalytics';

const mockData: DashboardAnalyticsDTO = {
  totalResumes: 12,
  topSkills: [
    { skill: 'react', count: 8 },
    { skill: 'typescript', count: 5 },
  ],
  topUniversities: [{ university: 'MIT', count: 3 }],
  matchAverages: [{ jobTitle: 'Frontend Engineer', averageScore: 75 }],
  updatedAt: '2024-06-01T12:00:00.000Z',
};

function makeHookResult(overrides = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useAnalytics>;
}

function renderAnalytics() {
  return render(
    <MemoryRouter>
      <AnalyticsPage />
    </MemoryRouter>,
  );
}

//  Loading state

describe('AnalyticsPage — loading', () => {
  it('shows a spinner while data is loading', () => {
    vi.mocked(useAnalytics).mockReturnValue(makeHookResult({ isLoading: true }));
    const { container } = renderAnalytics();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('does not render stat cards while loading', () => {
    vi.mocked(useAnalytics).mockReturnValue(makeHookResult({ isLoading: true }));
    renderAnalytics();
    expect(screen.queryByText('Resumes parsed')).not.toBeInTheDocument();
  });
});

//  Error state

describe('AnalyticsPage — error', () => {
  it('shows the error message when the request fails', () => {
    vi.mocked(useAnalytics).mockReturnValue(makeHookResult({ isError: true }));
    renderAnalytics();
    expect(screen.getByText('Failed to load analytics.')).toBeInTheDocument();
  });

  it('calls refetch when "Try again" is clicked', async () => {
    const refetch = vi.fn();
    vi.mocked(useAnalytics).mockReturnValue(makeHookResult({ isError: true, refetch }));
    renderAnalytics();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

//  Empty state

describe('AnalyticsPage — empty state', () => {
  beforeEach(() => {
    vi.mocked(useAnalytics).mockReturnValue(
      makeHookResult({ data: { ...mockData, updatedAt: null } }),
    );
  });

  it('shows the empty state when updatedAt is null', () => {
    renderAnalytics();
    expect(screen.getByText('No analytics yet')).toBeInTheDocument();
  });

  it('does not render stat cards in the empty state', () => {
    renderAnalytics();
    expect(screen.queryByText('Resumes parsed')).not.toBeInTheDocument();
  });
});

//  Data state

describe('AnalyticsPage — with data', () => {
  beforeEach(() => {
    vi.mocked(useAnalytics).mockReturnValue(makeHookResult({ data: mockData }));
  });

  it('renders the total resumes stat card', () => {
    renderAnalytics();
    expect(screen.getByText('Resumes parsed')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders the top skill stat card', () => {
    renderAnalytics();
    expect(screen.getByText('Top skill')).toBeInTheDocument();
    expect(screen.getAllByText('react').length).toBeGreaterThan(0);
  });

  it('renders the top university in the table', () => {
    renderAnalytics();
    expect(screen.getAllByText('MIT').length).toBeGreaterThan(0);
  });

  it('renders the match average for a job role', () => {
    renderAnalytics();
    expect(screen.getAllByText('Frontend Engineer').length).toBeGreaterThan(0);
    const scoreElements = screen.getAllByText('75%');
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it('renders a progress bar for each skill', () => {
    renderAnalytics();
    const bars = screen.getAllByRole('progressbar');
    expect(bars.length).toBeGreaterThanOrEqual(mockData.topSkills.length);
  });

  it('calls refetch when the Refresh button is clicked', async () => {
    const refetch = vi.fn();
    vi.mocked(useAnalytics).mockReturnValue(makeHookResult({ data: mockData, refetch }));
    renderAnalytics();
    await userEvent.click(screen.getByRole('button', { name: /refresh analytics/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
