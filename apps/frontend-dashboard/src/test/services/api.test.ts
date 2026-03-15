import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { api } from '@/services/api';

interface InterceptorHandler<V> {
  fulfilled: (value: V) => V | Promise<V>;
  rejected: (error: unknown) => unknown;
}

interface InterceptorManagerInternal<V> {
  handlers: Array<InterceptorHandler<V> | null>;
}

const getRequestHandler = (): InterceptorHandler<InternalAxiosRequestConfig> => {
  const manager = api.interceptors
    .request as unknown as InterceptorManagerInternal<InternalAxiosRequestConfig>;
  const handler = manager.handlers.find(Boolean);
  if (!handler) throw new Error('No request interceptor registered');
  return handler;
};

const getResponseHandler = (): InterceptorHandler<AxiosResponse> => {
  const manager = api.interceptors.response as unknown as InterceptorManagerInternal<AxiosResponse>;
  const handler = manager.handlers.find(Boolean);
  if (!handler) throw new Error('No response interceptor registered');
  return handler;
};

// Request interceptor

describe('api request interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('attaches the Bearer token from localStorage when one is present', () => {
    localStorage.setItem('token', 'my-jwt-token');

    const config = { headers: new axios.AxiosHeaders() } as InternalAxiosRequestConfig;
    const modified = getRequestHandler().fulfilled(config) as InternalAxiosRequestConfig;

    expect(modified.headers.Authorization).toBe('Bearer my-jwt-token');
  });

  it('does not add an Authorization header when no token is stored', () => {
    const config = { headers: new axios.AxiosHeaders() } as InternalAxiosRequestConfig;
    const modified = getRequestHandler().fulfilled(config) as InternalAxiosRequestConfig;

    expect(modified.headers.Authorization).toBeUndefined();
  });
});

// Response interceptor

describe('api response interceptor', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'old-token');
    localStorage.setItem('user', JSON.stringify({ id: '1' }));
  });

  it('clears localStorage and fires auth:unauthorized on a 401 response', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const error = { response: { status: 401 } };

    await expect(getResponseHandler().rejected(error)).rejects.toEqual(error);

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auth:unauthorized' }),
    );

    dispatchSpy.mockRestore();
  });

  it('re-throws errors that are not 401 without touching localStorage', async () => {
    const error = { response: { status: 500 } };

    await expect(getResponseHandler().rejected(error)).rejects.toEqual(error);

    expect(localStorage.getItem('token')).toBe('old-token');
  });

  it('passes successful responses through unchanged', () => {
    const stubConfig: InternalAxiosRequestConfig = {
      headers: new axios.AxiosHeaders(),
    };
    const response = {
      data: { status: 'success' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: stubConfig,
    } as AxiosResponse;

    const result = getResponseHandler().fulfilled(response);
    expect(result).toEqual(response);
  });
});
