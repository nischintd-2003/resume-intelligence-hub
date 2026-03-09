import type { UploadStatus } from '../types/upload.types';

export const TUS_ENDPOINT =
  (import.meta.env.VITE_TUS_ENDPOINT as string | undefined) ?? 'http://localhost/files/';

export const UPLOAD_CONFIG = {
  RETRY_DELAYS: [0, 1_000, 3_000, 5_000] as number[],

  ACCEPTED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
  ] as string[],

  ACCEPTED_EXTENSIONS: ['.pdf', '.docx', '.jpg', '.jpeg', '.png', '.webp'] as string[],

  MAX_SIZE_BYTES: 10 * 1024 * 1024,

  MAX_SIZE_LABEL: '10 MB',
} as const;

export const UPLOAD_COPY = {
  PAGE_TITLE: 'Upload Resumes — Resume Intelligence Hub',

  DROP_ZONE: {
    IDLE_HEADING: 'Drop resumes here',
    IDLE_SUBTEXT: 'or click to browse files',
    DRAGGING: 'Release to add files',
    CONSTRAINTS: `PDF, DOCX, JPEG, PNG · max ${UPLOAD_CONFIG.MAX_SIZE_LABEL} per file`,
  },

  ACTIONS: {
    UPLOAD_ALL: 'Upload all',
    UPLOADING: 'Uploading…',
    CLEAR_DONE: 'Clear completed',
    REMOVE: 'Remove file',
    RETRY: 'Retry',
  },

  STATUS: {
    IDLE: 'Ready',
    UPLOADING: 'Uploading',
    REGISTERING: 'Registering',
    DONE: 'Done',
    ERROR: 'Failed',
  } as const,

  ERRORS: {
    INVALID_TYPE: `Only PDF, DOCX, JPEG and PNG files are accepted.`,
    TOO_LARGE: `File exceeds the ${UPLOAD_CONFIG.MAX_SIZE_LABEL} limit.`,
    TUS_FAILED: 'Upload failed. Please try again.',
    REGISTER_FAILED: 'Upload succeeded but registration failed.',
  },

  EMPTY: 'No files selected yet.',
  FILES_QUEUED: (n: number) => `${n} file${n === 1 ? '' : 's'} queued`,
} as const;

export const STATUS_BADGE_CLASSES: Record<UploadStatus, string> = {
  idle: 'bg-slate-100 text-slate-500',
  uploading: 'bg-blue-50 text-blue-600',
  registering: 'bg-amber-50 text-amber-600',
  done: 'bg-green-50 text-green-600',
  error: 'bg-red-50 text-red-600',
};
