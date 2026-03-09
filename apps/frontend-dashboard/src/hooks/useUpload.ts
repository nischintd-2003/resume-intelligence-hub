import { useCallback, useRef, useState } from 'react';
import type { UploadFileItem, UploadStatus } from '../types/upload.types';
import { tusUploadFile } from '../services/upload.service';
import { resumeService } from '../services/resume.service';
import { UPLOAD_CONFIG, UPLOAD_COPY } from '../constants/upload.constants';
import { getApiErrorMessage } from '../utils/errors';
import type { UseUploadReturn } from '../types/response.types';

function makeItem(file: File, status: UploadStatus, error?: string): UploadFileItem {
  return {
    id: crypto.randomUUID(),
    file,
    status,
    progress: 0,
    error,
  };
}

function validateFile(file: File): string | null {
  if (!UPLOAD_CONFIG.ACCEPTED_MIME_TYPES.includes(file.type)) {
    return UPLOAD_COPY.ERRORS.INVALID_TYPE;
  }
  if (file.size > UPLOAD_CONFIG.MAX_SIZE_BYTES) {
    return UPLOAD_COPY.ERRORS.TOO_LARGE;
  }
  return null;
}

export function useUpload(): UseUploadReturn {
  const [items, setItems] = useState<UploadFileItem[]>([]);

  const abortFnsRef = useRef<Map<string, () => void>>(new Map());

  const patchItem = useCallback((id: string, patch: Partial<UploadFileItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadFileItem[] = files.map((file) => {
      const validationError = validateFile(file);
      return makeItem(file, validationError ? 'error' : 'idle', validationError ?? undefined);
    });
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const removeFile = useCallback((id: string) => {
    abortFnsRef.current.get(id)?.();
    abortFnsRef.current.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const uploadOne = useCallback(
    (item: UploadFileItem) => {
      patchItem(item.id, { status: 'uploading', progress: 0, error: undefined });

      const abort = tusUploadFile(item.file, {
        onProgress(percent) {
          patchItem(item.id, { progress: percent });
        },

        async onSuccess(minioPath) {
          patchItem(item.id, { status: 'registering', minioPath, progress: 100 });

          try {
            const registered = await resumeService.register(minioPath);
            patchItem(item.id, { status: 'done', resumeId: registered.id });
          } catch (err) {
            const message = getApiErrorMessage(err);
            patchItem(item.id, {
              status: 'error',
              error: `${UPLOAD_COPY.ERRORS.REGISTER_FAILED} (${message})`,
            });
          } finally {
            abortFnsRef.current.delete(item.id);
          }
        },

        onError(message) {
          patchItem(item.id, { status: 'error', error: message });
          abortFnsRef.current.delete(item.id);
        },
      });

      abortFnsRef.current.set(item.id, abort);
    },
    [patchItem],
  );

  const startAll = useCallback(() => {
    const idleItems = items.filter((item) => item.status === 'idle');
    idleItems.forEach(uploadOne);
  }, [items, uploadOne]);

  const clearDone = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.status !== 'done'));
  }, []);

  const isUploading = items.some(
    (item) => item.status === 'uploading' || item.status === 'registering',
  );

  return { items, isUploading, addFiles, removeFile, startAll, clearDone };
}
