import {
  idempotencyMiddleware,
  idempotencyOnRequest,
} from '@lib/idempotency.middleware';
import type { MergedOptions } from 'openapi-fetch';

const mockOptions = {} as MergedOptions;

describe('idempotencyMiddleware', () => {
  it('should add idempotency-key header for POST requests', async () => {
    const request = new Request('https://example.com/api/test', {
      method: 'POST',
    });

    await idempotencyMiddleware.onRequest!({
      request,
      schemaPath: '/api/test',
      params: {},
      id: 'test',
      options: mockOptions,
    });

    expect(request.headers.has('idempotency-key')).toBe(true);
    expect(request.headers.get('idempotency-key')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('should add idempotency-key header for PUT requests', async () => {
    const request = new Request('https://example.com/api/test', {
      method: 'PUT',
    });

    await idempotencyMiddleware.onRequest!({
      request,
      schemaPath: '/api/test',
      params: {},
      id: 'test',
      options: mockOptions,
    });

    expect(request.headers.has('idempotency-key')).toBe(true);
  });

  it('should add idempotency-key header for PATCH requests', async () => {
    const request = new Request('https://example.com/api/test', {
      method: 'PATCH',
    });

    await idempotencyMiddleware.onRequest!({
      request,
      schemaPath: '/api/test',
      params: {},
      id: 'test',
      options: mockOptions,
    });

    expect(request.headers.has('idempotency-key')).toBe(true);
  });

  it('should NOT add idempotency-key header for GET requests', async () => {
    const request = new Request('https://example.com/api/test', {
      method: 'GET',
    });

    await idempotencyMiddleware.onRequest!({
      request,
      schemaPath: '/api/test',
      params: {},
      id: 'test',
      options: mockOptions,
    });

    expect(request.headers.has('idempotency-key')).toBe(false);
  });

  it('should NOT add idempotency-key header for DELETE requests', async () => {
    const request = new Request('https://example.com/api/test', {
      method: 'DELETE',
    });

    await idempotencyMiddleware.onRequest!({
      request,
      schemaPath: '/api/test',
      params: {},
      id: 'test',
      options: mockOptions,
    });

    expect(request.headers.has('idempotency-key')).toBe(false);
  });
});

describe('idempotencyOnRequest', () => {
  it('should add idempotency-key header for POST requests', () => {
    const headers = new Headers();
    idempotencyOnRequest({ method: 'POST', headers });

    expect(headers.has('idempotency-key')).toBe(true);
  });

  it('should add idempotency-key header for PUT requests', () => {
    const headers = new Headers();
    idempotencyOnRequest({ method: 'PUT', headers });

    expect(headers.has('idempotency-key')).toBe(true);
  });

  it('should add idempotency-key header for PATCH requests', () => {
    const headers = new Headers();
    idempotencyOnRequest({ method: 'PATCH', headers });

    expect(headers.has('idempotency-key')).toBe(true);
  });

  it('should NOT add idempotency-key header for GET requests', () => {
    const headers = new Headers();
    idempotencyOnRequest({ method: 'GET', headers });

    expect(headers.has('idempotency-key')).toBe(false);
  });

  it('should NOT add idempotency-key header for DELETE requests', () => {
    const headers = new Headers();
    idempotencyOnRequest({ method: 'DELETE', headers });

    expect(headers.has('idempotency-key')).toBe(false);
  });

  it('should handle case-insensitive method names', () => {
    const headers = new Headers();
    idempotencyOnRequest({ method: 'post', headers });

    expect(headers.has('idempotency-key')).toBe(true);
  });
});
