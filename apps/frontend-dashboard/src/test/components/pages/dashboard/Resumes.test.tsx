import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResumesPage from '@/pages/dashboard/Resumes';
import type { ResumeDTO, MatchResultDTO, PaginatedResult } from '@/types/resume.types';

vi.mock('@/hooks/useResumes', () => ({
  useResumes: vi.fn(),
  useResumeMatches: vi.fn(),
}));

import { useResumes, useResumeMatches } from '@/hooks/useResumes';

// Shared mock data

const mockResume: ResumeDTO = {
  id: 'r1',
  minioPath: 'files/abc123def',
  status: 'parsed',
  extractedData: { skills: ['react', 'typescript'], experience: [], education: [], datesFound: [] },
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockMeta = {
  totalItems: 1,
  itemCount: 1,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
};

const mockMatch: MatchResultDTO = {
  id: 'm1',
  resumeId: 'r1',
  jobId: 'j1',
  score: 80,
  details: { matchedSkills: ['react'], missingSkills: ['go'] },
  jobRole: { id: 'j1', title: 'Frontend Engineer', isActive: true },
};

function setupMocks(
  options: {
    resumeData?: PaginatedResult<ResumeDTO> | undefined;
    isLoading?: boolean;
    isError?: boolean;
    matches?: MatchResultDTO[];
    matchesLoading?: boolean;
  } = {},
) {
  vi.mocked(useResumes).mockReturnValue({
    data: options.resumeData ?? undefined,
    isLoading: options.isLoading ?? false,
    isError: options.isError ?? false,
    isFetching: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useResumes>);

  vi.mocked(useResumeMatches).mockReturnValue({
    data: options.matches ?? [],
    isLoading: options.matchesLoading ?? false,
    isError: false,
  } as unknown as ReturnType<typeof useResumeMatches>);
}

function renderResumes() {
  return render(
    <MemoryRouter>
      <ResumesPage />
    </MemoryRouter>,
  );
}

// Loading state

describe('ResumesPage — loading', () => {
  it('shows a spinner while resumes are loading', () => {
    setupMocks({ isLoading: true });
    const { container } = renderResumes();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

//  Error state

describe('ResumesPage — error', () => {
  it('shows the error message when the request fails', () => {
    setupMocks({ isError: true });
    renderResumes();
    expect(screen.getByText('Failed to load resumes.')).toBeInTheDocument();
  });

  it('calls refetch when "Try again" is clicked', async () => {
    const refetch = vi.fn();
    vi.mocked(useResumes).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      refetch,
    } as unknown as ReturnType<typeof useResumes>);
    vi.mocked(useResumeMatches).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumeMatches>);

    renderResumes();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

// Empty state

describe('ResumesPage — empty state', () => {
  it('shows the empty state message when no resumes exist', () => {
    setupMocks({ resumeData: { data: [], meta: { ...mockMeta, totalItems: 0 } } });
    renderResumes();
    expect(screen.getByText('No resumes uploaded yet.')).toBeInTheDocument();
  });
});

//  With resumes

describe('ResumesPage — with resumes', () => {
  beforeEach(() => {
    setupMocks({ resumeData: { data: [mockResume], meta: mockMeta } });
  });

  it('renders the resume row with the filename', () => {
    renderResumes();
    // deriveFilename shortens the minioPath id
    expect(screen.getByText(/abc123def/i)).toBeInTheDocument();
  });

  it('renders the status badge', () => {
    renderResumes();
    expect(screen.getByText('Parsed')).toBeInTheDocument();
  });

  it('shows the total resume count in the header', () => {
    renderResumes();
    expect(screen.getByText(/1 resume/)).toBeInTheDocument();
  });
});

//  Matches panel

describe('ResumesPage — matches panel', () => {
  beforeEach(() => {
    setupMocks({
      resumeData: { data: [mockResume], meta: mockMeta },
      matches: [mockMatch],
    });
  });

  it('opens the matches panel when a resume row is clicked', async () => {
    renderResumes();
    await userEvent.click(screen.getAllByRole('row')[1]);
    await waitFor(() => {
      expect(screen.getByText('Match Scores')).toBeInTheDocument();
    });
  });

  it('shows the job title and score inside the matches panel', async () => {
    renderResumes();
    const rows = screen.getAllByRole('row');
    await userEvent.click(rows[1]);

    await waitFor(() => {
      expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  it('closes the matches panel when the close button is clicked', async () => {
    renderResumes();
    const rows = screen.getAllByRole('row');
    await userEvent.click(rows[1]);

    await waitFor(() => expect(screen.getByText('Match Scores')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /close match panel/i }));

    await waitFor(() => {
      expect(screen.queryByText('Match Scores')).not.toBeInTheDocument();
    });
  });

  it('closes the panel when the same row is clicked again (toggle)', async () => {
    renderResumes();
    const rows = screen.getAllByRole('row');
    await userEvent.click(rows[1]);
    await waitFor(() => expect(screen.getByText('Match Scores')).toBeInTheDocument());

    await userEvent.click(rows[1]);
    await waitFor(() => {
      expect(screen.queryByText('Match Scores')).not.toBeInTheDocument();
    });
  });
});

// Pagination

describe('ResumesPage — pagination', () => {
  it('does not render pagination when there is only one page', () => {
    setupMocks({ resumeData: { data: [mockResume], meta: { ...mockMeta, totalPages: 1 } } });
    renderResumes();
    expect(screen.queryByRole('button', { name: /previous page/i })).not.toBeInTheDocument();
  });

  it('renders pagination when there are multiple pages', () => {
    setupMocks({
      resumeData: {
        data: [mockResume],
        meta: { ...mockMeta, totalPages: 3, totalItems: 25 },
      },
    });
    renderResumes();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });

  it('disables the previous button on the first page', () => {
    setupMocks({
      resumeData: {
        data: [mockResume],
        meta: { ...mockMeta, currentPage: 1, totalPages: 3, totalItems: 25 },
      },
    });
    renderResumes();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });
});
