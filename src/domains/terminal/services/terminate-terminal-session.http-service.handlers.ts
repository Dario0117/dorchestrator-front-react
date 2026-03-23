import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type TerminateTerminalSessionSuccessResponse =
  operations['deleteApiV1ByOrganizationIdTerminalSessionsBySessionId']['responses']['200']['content']['application/json'];

// MSW path params are always strings, so we use a custom type for the handler
type TerminateTerminalSessionMswPathParams = {
  organizationId: string;
  sessionId: string;
};

export const terminateTerminalSessionHandler = http.delete<
  TerminateTerminalSessionMswPathParams,
  never,
  TerminateTerminalSessionSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/sessions/{sessionId}'),
  () => {
    return HttpResponse.json({
      responseData: { results: ['Session terminated'] },
      responseErrors: null,
    });
  },
);
