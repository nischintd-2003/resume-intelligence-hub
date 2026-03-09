// ─── TUS / Upload Config ──────────────────────────────────────────────────────

/**
 * Base URL of the TUS server.
 * nginx proxies  /files/  →  tusd:8080/files/
 * Override via VITE_TUS_ENDPOINT for non-default environments.
 */
export const TUS_ENDPOINT =
  (import.meta.env.VITE_TUS_ENDPOINT as string | undefined) ?? 'http://localhost/files/';

export const UPLOAD_CONFIG = {
  /** TUS retry delays in ms (0 = immediate first retry) */
  RETRY_DELAYS: [0, 1_000, 3_000, 5_000] as number[],

  /**
   * Accepted MIME types — must match what the OCR worker actually supports.
   *
   * worker-ocr/inspector.ts routes:
   *   application/pdf        → pdf-parse
   *   application/vnd...docx → mammoth
   *   image/*                → Tesseract OCR (jpeg, png, webp, etc.)
   */
  ACCEPTED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
  ] as string[],

  /** Human-readable accepted extensions shown in the UI */
  ACCEPTED_EXTENSIONS: ['.pdf', '.docx', '.jpg', '.jpeg', '.png', '.webp'] as string[],

  /** Maximum file size in bytes (10 MB) */
  MAX_SIZE_BYTES: 10 * 1024 * 1024,

  /** Maximum file size label for UI */
  MAX_SIZE_LABEL: '10 MB',
} as const;

// ─── UI Copy ──────────────────────────────────────────────────────────────────

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
