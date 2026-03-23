import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SuccessResponse =
  operations['deleteApiV1ByOrganizationIdTerminalSessionsBySessionIdShare']['responses']['200']['content']['application/json'];

// MSW path params are always strings, so we use a custom type for the handler
type UnshareSessionMswPathParams = {
  organizationId: string;
  sessionId: string;
};

export const unshareTerminalSessionHandler = http.delete<
  UnshareSessionMswPathParams,
  never,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/share',
  ),
  () => {
    return HttpResponse.json({
      responseData: { results: ['Session unshared'] },
      responseErrors: null,
    });
  },
);
