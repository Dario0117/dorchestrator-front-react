import { tracePropagationMiddleware } from '@lib/observability/trace-propagation.middleware';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function createMockRequest(headers?: Record<string, string>) {
  return new Request('https://example.com/api/test', {
    method: 'GET',
    headers,
  });
}

async function callOnRequest(request: Request) {
  const onRequest = tracePropagationMiddleware.onRequest;
  expect(onRequest).toBeDefined();

  await onRequest?.({
    request,
    schemaPath: '/api/test',
    params: {},
  } as Parameters<NonNullable<typeof onRequest>>[0]);
}

describe('tracePropagationMiddleware', () => {
  describe('onRequest', () => {
    it('sets x-request-id header when not present', async () => {
      const request = createMockRequest();

      await callOnRequest(request);

      expect(request.headers.has('x-request-id')).toBe(true);
    });

    it('preserves existing x-request-id header', async () => {
      const existingId = 'existing-request-id';
      const request = createMockRequest({ 'x-request-id': existingId });

      await callOnRequest(request);

      expect(request.headers.get('x-request-id')).toBe(existingId);
    });

    it('generates a valid UUID for x-request-id', async () => {
      const request = createMockRequest();

      await callOnRequest(request);

      const requestId = request.headers.get('x-request-id');
      expect(requestId).toMatch(UUID_REGEX);
    });
  });
});
