import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type RequestBody =
  operations['postApiV1ByOrganizationIdTerminalSessionsBySessionIdExtend']['requestBody']['content']['application/json'];
type SuccessResponse =
  operations['postApiV1ByOrganizationIdTerminalSessionsBySessionIdExtend']['responses']['200']['content']['application/json'];

// MSW path params are always strings, so we use a custom type for the handler
type ExtendSessionMswPathParams = {
  organizationId: string;
  sessionId: string;
};

export const extendTerminalSessionHandler = http.post<
  ExtendSessionMswPathParams,
  RequestBody,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/extend',
  ),
  () => {
    return HttpResponse.json({
      responseData: { results: ['Session extended'] },
      responseErrors: null,
    });
  },
);
