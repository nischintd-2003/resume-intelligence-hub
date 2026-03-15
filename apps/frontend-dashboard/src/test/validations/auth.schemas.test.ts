import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '@/validations/auth.schemas';

// loginSchema

describe('loginSchema', () => {
  const valid = { email: 'user@example.com', password: 'secret123' };

  it('passes with valid email and password', () => {
    expect(loginSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when email is missing', () => {
    const result = loginSchema.safeParse({ ...valid, email: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain('email');
    }
  });

  it('fails when email is not a valid email address', () => {
    const result = loginSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('fails when password is empty', () => {
    const result = loginSchema.safeParse({ ...valid, password: '' });
    expect(result.success).toBe(false);
  });

  it('fails when password is fewer than 6 characters', () => {
    const result = loginSchema.safeParse({ ...valid, password: '12345' });
    expect(result.success).toBe(false);
  });

  it('passes when password is exactly 6 characters', () => {
    expect(loginSchema.safeParse({ ...valid, password: '123456' }).success).toBe(true);
  });
});

//  registerSchema

describe('registerSchema', () => {
  const valid = {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'secret123',
    confirmPassword: 'secret123',
  };

  it('passes with all valid fields', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when username is shorter than 3 characters', () => {
    const result = registerSchema.safeParse({ ...valid, username: 'ab' });
    expect(result.success).toBe(false);
  });

  it('fails when username exceeds 20 characters', () => {
    const result = registerSchema.safeParse({
      ...valid,
      username: 'a'.repeat(21),
    });
    expect(result.success).toBe(false);
  });

  it('fails when username contains special characters', () => {
    const result = registerSchema.safeParse({ ...valid, username: 'john doe!' });
    expect(result.success).toBe(false);
  });

  it('passes when username contains underscores and numbers', () => {
    expect(registerSchema.safeParse({ ...valid, username: 'john_123' }).success).toBe(true);
  });

  it('fails when email is invalid', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('fails when password is fewer than 6 characters', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: '123',
      confirmPassword: '123',
    });
    expect(result.success).toBe(false);
  });

  it('fails when passwords do not match', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'secret123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain('confirmPassword');
    }
  });

  it('passes when password and confirmPassword match exactly', () => {
    expect(
      registerSchema.safeParse({ ...valid, password: 'abcdef', confirmPassword: 'abcdef' }).success,
    ).toBe(true);
  });
});
