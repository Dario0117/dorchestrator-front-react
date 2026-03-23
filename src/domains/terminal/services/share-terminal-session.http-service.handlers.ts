import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SuccessResponse =
  operations['postApiV1ByOrganizationIdTerminalSessionsBySessionIdShare']['responses']['200']['content']['application/json'];

// MSW path params are always strings, so we use a custom type for the handler
type ShareSessionMswPathParams = {
  organizationId: string;
  sessionId: string;
};

export const shareTerminalSessionHandler = http.post<
  ShareSessionMswPathParams,
  never,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/share',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          sessionId: 1,
          shareToken: 'mock-share-token',
          isShared: true,
        },
      },
      responseErrors: null,
    });
  },
);
