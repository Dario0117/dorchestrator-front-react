import { getTracePropagationHeaders } from '@lib/observability/tracer';
import type { Middleware } from 'openapi-fetch';

export const tracePropagationMiddleware: Middleware = {
  // biome-ignore lint/suspicious/useAwait: middleware interface requires async
  async onRequest({ request }) {
    const headers = getTracePropagationHeaders();
    for (const [key, value] of Object.entries(headers)) {
      request.headers.set(key, value);
    }

    if (!request.headers.has('x-request-id')) {
      request.headers.set('x-request-id', crypto.randomUUID());
    }
  },
};
