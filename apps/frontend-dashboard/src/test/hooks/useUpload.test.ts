import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpload } from '@/hooks/useUpload';
import { UPLOAD_COPY, UPLOAD_CONFIG } from '@/constants/upload.constants';

//  Mock external dependencies

vi.mock('@/services/upload.service', () => ({
  tusUploadFile: vi.fn(),
}));

vi.mock('@/services/resume.service', () => ({
  resumeService: {
    register: vi.fn(),
  },
}));

import { tusUploadFile } from '@/services/upload.service';
import { resumeService } from '@/services/resume.service';

// Helpers

function makeFile(name = 'cv.pdf', type = 'application/pdf', size = 1024): File {
  return new File(['x'.repeat(size)], name, { type });
}

// addFiles

describe('useUpload — addFiles', () => {
  it('adds a valid PDF file with status "idle"', () => {
    const { result } = renderHook(() => useUpload());

    act(() => {
      result.current.addFiles([makeFile()]);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].status).toBe('idle');
    expect(result.current.items[0].error).toBeUndefined();
  });

  it('adds a file with status "error" when the MIME type is not allowed', () => {
    const { result } = renderHook(() => useUpload());

    act(() => {
      result.current.addFiles([makeFile('malware.exe', 'application/x-msdownload')]);
    });

    expect(result.current.items[0].status).toBe('error');
    expect(result.current.items[0].error).toBe(UPLOAD_COPY.ERRORS.INVALID_TYPE);
  });

  it('adds a file with status "error" when the file exceeds the max size', () => {
    const bigFile = makeFile('big.pdf', 'application/pdf');
    Object.defineProperty(bigFile, 'size', {
      value: UPLOAD_CONFIG.MAX_SIZE_BYTES + 1,
    });

    const { result } = renderHook(() => useUpload());

    act(() => {
      result.current.addFiles([bigFile]);
    });

    expect(result.current.items[0].status).toBe('error');
    expect(result.current.items[0].error).toBe(UPLOAD_COPY.ERRORS.TOO_LARGE);
  });

  it('accumulates items across multiple addFiles calls', () => {
    const { result } = renderHook(() => useUpload());

    act(() => result.current.addFiles([makeFile('a.pdf')]));
    act(() => result.current.addFiles([makeFile('b.pdf')]));

    expect(result.current.items).toHaveLength(2);
  });

  it('each item receives a unique id', () => {
    const { result } = renderHook(() => useUpload());

    act(() => {
      result.current.addFiles([makeFile('a.pdf'), makeFile('b.pdf')]);
    });

    const ids = result.current.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(2);
  });
});

//  removeFile

describe('useUpload — removeFile', () => {
  it('removes the item with the given id', () => {
    const { result } = renderHook(() => useUpload());

    act(() => result.current.addFiles([makeFile()]));
    const id = result.current.items[0].id;

    act(() => result.current.removeFile(id));

    expect(result.current.items).toHaveLength(0);
  });

  it('does not affect other items when removing one', () => {
    const { result } = renderHook(() => useUpload());

    act(() => result.current.addFiles([makeFile('a.pdf'), makeFile('b.pdf')]));
    const idToRemove = result.current.items[0].id;

    act(() => result.current.removeFile(idToRemove));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].file.name).toBe('b.pdf');
  });
});

//  clearDone

describe('useUpload — clearDone', () => {
  it('removes only items with status "done"', async () => {
    vi.mocked(tusUploadFile).mockImplementation((_file, { onSuccess }) => {
      onSuccess('files/path');
      return () => {};
    });
    vi.mocked(resumeService.register).mockResolvedValue({
      id: 'r1',
      minioPath: 'files/path',
      status: 'uploaded',
      extractedData: null,
      createdAt: '',
    });

    const { result } = renderHook(() => useUpload());

    act(() =>
      result.current.addFiles([
        makeFile('good.pdf'),
        makeFile('bad.exe', 'application/x-msdownload'),
      ]),
    );

    await act(async () => result.current.startAll());
    await act(async () => result.current.clearDone());

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].status).toBe('error');
  });
});

//  isUploading

describe('useUpload — isUploading', () => {
  it('is false when no items are present', () => {
    const { result } = renderHook(() => useUpload());
    expect(result.current.isUploading).toBe(false);
  });

  it('is false when all items are idle', () => {
    const { result } = renderHook(() => useUpload());
    act(() => result.current.addFiles([makeFile()]));
    expect(result.current.isUploading).toBe(false);
  });

  it('is true while tusUploadFile is in progress (status = uploading)', () => {
    vi.mocked(tusUploadFile).mockReturnValue(() => {});

    const { result } = renderHook(() => useUpload());
    act(() => result.current.addFiles([makeFile()]));
    act(() => result.current.startAll());

    expect(result.current.isUploading).toBe(true);
  });
});

//  startAll

describe('useUpload — startAll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('only starts idle items — skips error items', () => {
    vi.mocked(tusUploadFile).mockReturnValue(() => {});

    const { result } = renderHook(() => useUpload());

    act(() =>
      result.current.addFiles([
        makeFile('good.pdf'),
        makeFile('bad.exe', 'application/x-msdownload'),
      ]),
    );

    act(() => result.current.startAll());

    expect(tusUploadFile).toHaveBeenCalledTimes(1);
    expect(vi.mocked(tusUploadFile).mock.calls[0][0].name).toBe('good.pdf');
  });

  it('transitions item to "registering" then "done" on successful upload + register', async () => {
    vi.mocked(tusUploadFile).mockImplementation((_file, { onSuccess }) => {
      onSuccess('files/abc');
      return () => {};
    });

    vi.mocked(resumeService.register).mockResolvedValueOnce({
      id: 'r-new',
      minioPath: 'files/abc',
      status: 'uploaded',
      extractedData: null,
      createdAt: '',
    });

    const { result } = renderHook(() => useUpload());

    act(() => result.current.addFiles([makeFile()]));
    await act(async () => result.current.startAll());

    const item = result.current.items[0];
    expect(item.status).toBe('done');
    expect(item.resumeId).toBe('r-new');
    expect(item.progress).toBe(100);
  });

  it('sets status "error" when resumeService.register rejects', async () => {
    vi.mocked(tusUploadFile).mockImplementation((_file, { onSuccess }) => {
      onSuccess('files/abc');
      return () => {};
    });

    vi.mocked(resumeService.register).mockRejectedValueOnce(new Error('Server down'));

    const { result } = renderHook(() => useUpload());

    act(() => result.current.addFiles([makeFile()]));
    await act(async () => result.current.startAll());

    expect(result.current.items[0].status).toBe('error');
    expect(result.current.items[0].error).toContain(UPLOAD_COPY.ERRORS.REGISTER_FAILED);
  });

  it('sets status "error" when tusUploadFile calls onError', async () => {
    vi.mocked(tusUploadFile).mockImplementation((_file, { onError }) => {
      onError('TUS upload failed');
      return () => {};
    });

    const { result } = renderHook(() => useUpload());

    act(() => result.current.addFiles([makeFile()]));
    await act(async () => result.current.startAll());

    expect(result.current.items[0].status).toBe('error');
    expect(result.current.items[0].error).toBe('TUS upload failed');
  });

  it('updates progress as tusUploadFile calls onProgress', () => {
    let capturedOnProgress: ((p: number) => void) | null = null;

    vi.mocked(tusUploadFile).mockImplementation((_file, { onProgress }) => {
      capturedOnProgress = onProgress;
      return () => {};
    });

    const { result } = renderHook(() => useUpload());
    act(() => result.current.addFiles([makeFile()]));
    act(() => result.current.startAll());

    act(() => capturedOnProgress!(50));

    expect(result.current.items[0].progress).toBe(50);
  });
});
