import { describe, it, expect } from 'vitest';
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { getApiErrorMessage } from '../../utils/errors';
import { AUTH_COPY } from '@/constants/auth.constants';

const stubConfig: InternalAxiosRequestConfig = {
  headers: new axios.AxiosHeaders(),
};

describe('getApiErrorMessage', () => {
  it('returns the server message when axios error has a string message', () => {
    const err = new axios.AxiosError('Request failed');
    err.response = {
      data: { message: 'Email is already registered' },
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: stubConfig,
    };
    expect(getApiErrorMessage(err)).toBe('Email is already registered');
  });

  it('returns the generic fallback when the axios error has no response', () => {
    const err = new axios.AxiosError('Network error');
    expect(getApiErrorMessage(err)).toBe(AUTH_COPY.ERRORS.GENERIC);
  });

  it('returns the generic fallback when response message is not a string', () => {
    const err = new axios.AxiosError('Bad data');
    err.response = {
      data: { message: 42 },
      status: 500,
      statusText: 'Error',
      headers: {},
      config: stubConfig,
    };
    expect(getApiErrorMessage(err)).toBe(AUTH_COPY.ERRORS.GENERIC);
  });

  it('returns the generic fallback when response message is an empty string', () => {
    const err = new axios.AxiosError('Empty');
    err.response = {
      data: { message: '' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: stubConfig,
    };
    expect(getApiErrorMessage(err)).toBe(AUTH_COPY.ERRORS.GENERIC);
  });

  it('returns the generic fallback for non-axios errors', () => {
    expect(getApiErrorMessage(new Error('plain error'))).toBe(AUTH_COPY.ERRORS.GENERIC);
    expect(getApiErrorMessage('string error')).toBe(AUTH_COPY.ERRORS.GENERIC);
    expect(getApiErrorMessage(null)).toBe(AUTH_COPY.ERRORS.GENERIC);
  });
});
