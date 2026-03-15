import * as tus from 'tus-js-client';
import { TUS_ENDPOINT, UPLOAD_CONFIG, UPLOAD_COPY } from '../constants/upload.constants';
import type { TusUploadCallbacks } from '../types/upload.types';

function deriveMinioPath(uploadUrl: string): string {
  try {
    const rawPath = new URL(uploadUrl).pathname.slice(1);
    const plusIdx = rawPath.indexOf('+');
    return plusIdx !== -1 ? rawPath.slice(0, plusIdx) : rawPath;
  } catch {
    const marker = '/files/';
    const idx = uploadUrl.indexOf(marker);
    const raw = idx !== -1 ? uploadUrl.slice(idx + 1) : uploadUrl;
    const plusIdx = raw.indexOf('+');
    return plusIdx !== -1 ? raw.slice(0, plusIdx) : raw;
  }
}

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
      onProgress(Math.min(percent, 99));
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

    onError() {
      if (aborted) return;
      onError(UPLOAD_COPY.ERRORS.TUS_FAILED);
    },
  });

  upload.start();

  return () => {
    aborted = true;
    upload.abort();
  };
}
