import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import UploadPage from '@/pages/dashboard/Upload';
import { UPLOAD_COPY } from '@/constants/upload.constants';
import type { UploadFileItem } from '@/types/upload.types';

vi.mock('@/hooks/useUpload', () => ({
  useUpload: vi.fn(),
}));

import { useUpload } from '@/hooks/useUpload';

// Helpers

function makeItem(overrides: Partial<UploadFileItem> = {}): UploadFileItem {
  return {
    id: crypto.randomUUID(),
    file: new File(['x'], overrides.file?.name ?? 'cv.pdf', { type: 'application/pdf' }),
    status: 'idle',
    progress: 0,
    ...overrides,
  };
}

function makeHookResult(overrides: Partial<ReturnType<typeof useUpload>> = {}) {
  return {
    items: [],
    isUploading: false,
    addFiles: vi.fn(),
    removeFile: vi.fn(),
    startAll: vi.fn(),
    clearDone: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useUpload>;
}

function renderUpload() {
  return render(
    <MemoryRouter>
      <UploadPage />
    </MemoryRouter>,
  );
}

// Initial render

describe('UploadPage — rendering', () => {
  beforeEach(() => {
    vi.mocked(useUpload).mockReturnValue(makeHookResult());
  });

  it('sets the document title', () => {
    renderUpload();
    expect(document.title).toBe(UPLOAD_COPY.PAGE_TITLE);
  });

  it('renders the drop zone', () => {
    renderUpload();
    expect(screen.getByRole('button', { name: /upload drop zone/i })).toBeInTheDocument();
  });

  it('does not render the upload button when there are no idle items', () => {
    renderUpload();
    expect(screen.queryByRole('button', { name: /upload all/i })).not.toBeInTheDocument();
  });

  it('does not render the file list when there are no items', () => {
    renderUpload();
    expect(screen.queryByRole('region', { name: /selected files/i })).not.toBeInTheDocument();
  });
});

// File list

describe('UploadPage — file list', () => {
  it('renders the file list section when items are present', () => {
    vi.mocked(useUpload).mockReturnValue(makeHookResult({ items: [makeItem()] }));
    renderUpload();
    expect(screen.getByRole('region', { name: /selected files/i })).toBeInTheDocument();
  });

  it('renders the correct file count label', () => {
    vi.mocked(useUpload).mockReturnValue(makeHookResult({ items: [makeItem(), makeItem()] }));
    renderUpload();
    expect(screen.getByText(UPLOAD_COPY.FILES_QUEUED(2))).toBeInTheDocument();
  });

  it('renders each file name', () => {
    vi.mocked(useUpload).mockReturnValue(
      makeHookResult({
        items: [
          makeItem({ file: new File(['x'], 'resume-a.pdf', { type: 'application/pdf' }) }),
          makeItem({ file: new File(['x'], 'resume-b.pdf', { type: 'application/pdf' }) }),
        ],
      }),
    );
    renderUpload();
    expect(screen.getByText('resume-a.pdf')).toBeInTheDocument();
    expect(screen.getByText('resume-b.pdf')).toBeInTheDocument();
  });

  it('renders the "Ready" status badge for idle items', () => {
    vi.mocked(useUpload).mockReturnValue(makeHookResult({ items: [makeItem({ status: 'idle' })] }));
    renderUpload();
    expect(screen.getByText(UPLOAD_COPY.STATUS.IDLE)).toBeInTheDocument();
  });

  it('renders the "Failed" status badge for error items', () => {
    vi.mocked(useUpload).mockReturnValue(
      makeHookResult({ items: [makeItem({ status: 'error', error: 'Upload failed' })] }),
    );
    renderUpload();
    expect(screen.getByText(UPLOAD_COPY.STATUS.ERROR)).toBeInTheDocument();
  });

  it('renders the error message text for error items', () => {
    vi.mocked(useUpload).mockReturnValue(
      makeHookResult({ items: [makeItem({ status: 'error', error: 'File too large' })] }),
    );
    renderUpload();
    expect(screen.getByText('File too large')).toBeInTheDocument();
  });

  it('renders the progress bar for uploading items', () => {
    vi.mocked(useUpload).mockReturnValue(
      makeHookResult({ items: [makeItem({ status: 'uploading', progress: 45 })] }),
    );
    renderUpload();
    expect(screen.getByRole('progressbar', { name: /uploading cv.pdf: 45%/i })).toBeInTheDocument();
  });

  it('shows "Clear completed" button when done items exist', () => {
    vi.mocked(useUpload).mockReturnValue(makeHookResult({ items: [makeItem({ status: 'done' })] }));
    renderUpload();
    expect(screen.getByText(UPLOAD_COPY.ACTIONS.CLEAR_DONE)).toBeInTheDocument();
  });

  it('calls clearDone when "Clear completed" is clicked', async () => {
    const clearDone = vi.fn();
    vi.mocked(useUpload).mockReturnValue(
      makeHookResult({ items: [makeItem({ status: 'done' })], clearDone }),
    );
    renderUpload();
    await userEvent.click(screen.getByText(UPLOAD_COPY.ACTIONS.CLEAR_DONE));
    expect(clearDone).toHaveBeenCalledTimes(1);
  });
});

// Remove button

describe('UploadPage — remove file', () => {
  it('renders a remove button for idle items', () => {
    vi.mocked(useUpload).mockReturnValue(makeHookResult({ items: [makeItem({ status: 'idle' })] }));
    renderUpload();
    expect(
      screen.getByRole('button', { name: new RegExp(UPLOAD_COPY.ACTIONS.REMOVE) }),
    ).toBeInTheDocument();
  });

  it('calls removeFile with the correct id when the remove button is clicked', async () => {
    const removeFile = vi.fn();
    const item = makeItem({ status: 'idle' });
    vi.mocked(useUpload).mockReturnValue(makeHookResult({ items: [item], removeFile }));
    renderUpload();
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(UPLOAD_COPY.ACTIONS.REMOVE) }),
    );
    expect(removeFile).toHaveBeenCalledWith(item.id);
  });
});

// Upload button

describe('UploadPage — upload button', () => {
  it('renders the upload button when idle items exist', () => {
    vi.mocked(useUpload).mockReturnValue(makeHookResult({ items: [makeItem({ status: 'idle' })] }));
    renderUpload();
    expect(
      screen.getByRole('button', { name: new RegExp(UPLOAD_COPY.ACTIONS.UPLOAD_ALL) }),
    ).toBeInTheDocument();
  });

  it('calls startAll when the upload button is clicked', async () => {
    const startAll = vi.fn();
    vi.mocked(useUpload).mockReturnValue(
      makeHookResult({ items: [makeItem({ status: 'idle' })], startAll }),
    );
    renderUpload();
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(UPLOAD_COPY.ACTIONS.UPLOAD_ALL) }),
    );
    expect(startAll).toHaveBeenCalledTimes(1);
  });

  it('shows the uploading label and disables the button while isUploading is true', () => {
    vi.mocked(useUpload).mockReturnValue(
      makeHookResult({
        items: [makeItem({ status: 'uploading' })],
        isUploading: true,
      }),
    );
    renderUpload();
    expect(
      screen.queryByRole('button', { name: new RegExp(UPLOAD_COPY.ACTIONS.UPLOAD_ALL) }),
    ).not.toBeInTheDocument();
  });
});
