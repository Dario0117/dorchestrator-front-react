import type { Middleware } from 'openapi-fetch';

const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';
const METHODS_REQUIRING_IDEMPOTENCY = new Set(['POST', 'PUT', 'PATCH']);

function requiresIdempotencyKey(method: string) {
  return METHODS_REQUIRING_IDEMPOTENCY.has(method.toUpperCase());
}

export const idempotencyMiddleware: Middleware = {
  // biome-ignore lint/suspicious/useAwait: middleware interface requires async
  async onRequest({ request }) {
    if (requiresIdempotencyKey(request.method)) {
      request.headers.set(IDEMPOTENCY_KEY_HEADER, crypto.randomUUID());
    }
  },
};

export function idempotencyOnRequest(context: {
  method: string;
  headers: Headers;
}) {
  if (requiresIdempotencyKey(context.method)) {
    context.headers.set(IDEMPOTENCY_KEY_HEADER, crypto.randomUUID());
  }
}
