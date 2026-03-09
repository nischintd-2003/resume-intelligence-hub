import * as tus from 'tus-js-client';
import { TUS_ENDPOINT, UPLOAD_CONFIG, UPLOAD_COPY } from '../constants/upload.constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TusUploadCallbacks {
  onProgress: (percent: number) => void;
  onSuccess: (minioPath: string) => void;
  onError: (message: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives the MinIO object path from the TUS upload URL.
 *
 * tusd returns:  http://localhost/files/{hex-id}+{base64-session-data}
 * MinIO stores:  {hex-id}                          ← the actual object key
 * We need:       files/{hex-id}                    ← what the backend expects
 *
 * The `+{base64}` suffix is tusd session metadata appended to the URL — it is
 * NOT part of the S3 object key.  storage.ts strips the `files/` prefix with a
 * regex but leaves the `+` suffix, causing S3 GetObject to fail with NoSuchKey.
 * We must strip it here before sending minioPath to POST /api/resumes.
 */
function deriveMinioPath(uploadUrl: string): string {
  try {
    // URL.pathname → '/files/{hex-id}+{session}', slice(1) removes leading '/'
    const rawPath = new URL(uploadUrl).pathname.slice(1);
    // Strip tusd session suffix (everything from '+' onwards)
    const plusIdx = rawPath.indexOf('+');
    return plusIdx !== -1 ? rawPath.slice(0, plusIdx) : rawPath;
  } catch {
    // Fallback for unparseable URLs
    const marker = '/files/';
    const idx = uploadUrl.indexOf(marker);
    const raw = idx !== -1 ? uploadUrl.slice(idx + 1) : uploadUrl;
    const plusIdx = raw.indexOf('+');
    return plusIdx !== -1 ? raw.slice(0, plusIdx) : raw;
  }
}

// ─── Core upload function ─────────────────────────────────────────────────────

/**
 * Starts a resumable TUS upload for a single file.
 *
 * Responsibilities:
 *   - Creates and starts the tus.Upload
 *   - Reports progress via onProgress (0–100)
 *   - Calls onSuccess with the derived minioPath on completion
 *   - Calls onError with a readable message on failure
 *
 * Returns an abort function. Call it to cancel the upload.
 * Safe to call even after the upload has already completed.
 */
export function tusUploadFile(
  file: File,
  { onProgress, onSuccess, onError }: TusUploadCallbacks,
): () => void {
  let aborted = false;

  const upload = new tus.Upload(file, {
    endpoint: TUS_ENDPOINT,
    retryDelays: UPLOAD_CONFIG.RETRY_DELAYS,
    metadata: {
      filename: file.name,
      filetype: file.type,
    },

    onProgress(bytesUploaded: number, bytesTotal: number) {
      if (aborted) return;
      const percent = bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;
      onProgress(Math.min(percent, 99)); // stay at 99 until onSuccess fires
    },

    onSuccess() {
      if (aborted) return;
      const url = upload.url;
      if (!url) {
        onError(UPLOAD_COPY.ERRORS.TUS_FAILED);
        return;
      }
      const minioPath = deriveMinioPath(url);
      onProgress(100);
      onSuccess(minioPath);
    },

    onError(err: Error) {
      if (aborted) return;
      console.error('[TUS] upload error:', err);
      onError(UPLOAD_COPY.ERRORS.TUS_FAILED);
    },
  });

  upload.start();

  return () => {
    aborted = true;
    upload.abort();
  };
}
