import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SuccessResponse =
  operations['postApiV1ByOrganizationIdTerminalSessionsBySessionIdUnlock']['responses']['200']['content']['application/json'];

export const unlockTerminalSessionHandler = http.post<
  { organizationId: string; sessionId: string },
  never,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/unlock',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: [],
      },
      responseErrors: null,
    });
  },
);
