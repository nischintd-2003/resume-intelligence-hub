import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  deriveFilename,
  formatDate,
  validateForm,
  formatDateAnalytics,
} from '@/utils/dashboard.utils';

// formatBytes

describe('formatBytes', () => {
  it('returns bytes label for values under 1 KB', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('returns KB label for values between 1 KB and 1 MB', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('returns MB label for values 1 MB and above', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(10 * 1024 * 1024)).toBe('10.0 MB');
  });
});

// deriveFilename

describe('deriveFilename', () => {
  it('returns the last path segment when it is 16 chars or fewer', () => {
    expect(deriveFilename('files/abcdef')).toBe('abcdef');
    expect(deriveFilename('files/1234567890123456')).toBe('1234567890123456');
  });

  it('truncates with ellipsis when the last segment exceeds 16 chars', () => {
    expect(deriveFilename('files/12345678901234567')).toBe('123456789012…');
  });

  it('returns the whole string if there are no slashes', () => {
    expect(deriveFilename('shortid')).toBe('shortid');
  });
});

//  formatDate

describe('formatDate', () => {
  it('formats an ISO date string to dd MMM yyyy (en-GB)', () => {
    const result = formatDate('2024-03-15T00:00:00.000Z');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });
});

// validateForm

describe('validateForm', () => {
  it('returns no errors for a valid input', () => {
    expect(validateForm({ title: 'Senior Engineer', requiredSkills: ['React'] })).toEqual({});
  });

  it('returns a title error when title is shorter than 3 characters', () => {
    const errors = validateForm({ title: 'ab', requiredSkills: ['React'] });
    expect(errors.title).toBeDefined();
  });

  it('returns a skills error when requiredSkills is empty', () => {
    const errors = validateForm({ title: 'Engineer', requiredSkills: [] });
    expect(errors.requiredSkills).toBeDefined();
  });

  it('returns both errors when title is too short and skills are empty', () => {
    const errors = validateForm({ title: 'ab', requiredSkills: [] });
    expect(errors.title).toBeDefined();
    expect(errors.requiredSkills).toBeDefined();
  });

  it('trims whitespace before checking title length', () => {
    const errors = validateForm({ title: '  ', requiredSkills: ['React'] });
    expect(errors.title).toBeDefined();
  });
});

// formatDateAnalytics

describe('formatDateAnalytics', () => {
  it('includes the year in the output', () => {
    const result = formatDateAnalytics('2024-06-01T14:30:00.000Z');
    expect(result).toMatch(/2024/);
  });

  it('produces a different string from formatDate (includes time)', () => {
    const iso = '2024-06-01T14:30:00.000Z';
    expect(formatDateAnalytics(iso).length).toBeGreaterThan(formatDate(iso).length);
  });
});
