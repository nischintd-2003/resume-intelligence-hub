import type { CreateJobFormErrors, CreateJobFormValues } from '../types/job.types';

// Uploads

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Resumes

export function deriveFilename(minioPath: string): string {
  const parts = minioPath.split('/');
  const id = parts[parts.length - 1] ?? minioPath;
  return id.length > 16 ? `${id.slice(0, 12)}…` : id;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Jobs

export function validateForm(values: CreateJobFormValues): CreateJobFormErrors {
  const errors: CreateJobFormErrors = {};
  if (values.title.trim().length < 3) {
    errors.title = 'Job title must be at least 3 characters.';
  }
  if (values.requiredSkills.length === 0) {
    errors.requiredSkills = 'At least one required skill is needed.';
  }
  return errors;
}
