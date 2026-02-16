import { tracePropagationMiddleware } from '@lib/observability/trace-propagation.middleware';
import type { MergedOptions } from 'openapi-fetch';

const mockOptions = {} as MergedOptions;

describe('tracePropagationMiddleware', () => {
  it('should add x-request-id header when not present', async () => {
    const request = new Request('https://example.com/api/test', {
      method: 'GET',
    });

    await tracePropagationMiddleware.onRequest!({
      request,
      schemaPath: '/api/test',
      params: {},
      id: 'test',
      options: mockOptions,
    });

    expect(request.headers.has('x-request-id')).toBe(true);
    // UUID format check
    expect(request.headers.get('x-request-id')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('should not overwrite existing x-request-id header', async () => {
    const request = new Request('https://example.com/api/test', {
      method: 'GET',
      headers: { 'x-request-id': 'existing-id' },
    });

    await tracePropagationMiddleware.onRequest!({
      request,
      schemaPath: '/api/test',
      params: {},
      id: 'test',
      options: mockOptions,
    });

    expect(request.headers.get('x-request-id')).toBe('existing-id');
  });
});
