import type { ResumeStatus } from '../types/resume.types';

export const RESUME_QUERY_KEYS = {
  all: ['resumes'] as const,
  paginated: (page: number, limit: number) => ['resumes', 'list', page, limit] as const,
  detail: (id: string) => ['resumes', 'detail', id] as const,
  matches: (id: string) => ['resumes', 'matches', id] as const,
};

export const STATUS_CLASSES: Record<ResumeStatus, string> = {
  uploaded: 'bg-slate-100 text-slate-500',
  ocr_processing: 'bg-blue-50 text-blue-500',
  extracted: 'bg-blue-50 text-blue-600',
  parsed: 'bg-green-50 text-green-600',
  failed: 'bg-red-50 text-red-500',
};

export const STATUS_LABELS: Record<ResumeStatus, string> = {
  uploaded: 'Uploaded',
  ocr_processing: 'Processing',
  extracted: 'Extracted',
  parsed: 'Parsed',
  failed: 'Failed',
};
