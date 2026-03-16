import { describe, it, expect } from 'vitest';
import { cn } from '../../utils/cn';

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('text-sm')).toBe('text-sm');
  });

  it('joins multiple classes', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold');
  });

  it('ignores falsy values', () => {
    expect(cn('text-sm', false, null, undefined, 'font-bold')).toBe('text-sm font-bold');
  });

  it('resolves conflicting Tailwind classes — last one wins', () => {
    expect(cn('bg-blue-500', 'bg-red-500')).toBe('bg-red-500');
  });

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-green-500': false })).toBe('text-red-500');
  });
});
