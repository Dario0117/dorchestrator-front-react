import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type MswPathParams = {
  organizationId: string;
  sessionId: string;
  suggestionId: string;
};
type RequestBody =
  operations['postApiV1ByOrganizationIdTerminalSessionsBySessionIdSuggestionsBySuggestionIdRespond']['requestBody']['content']['application/json'];
type SuccessResponse =
  operations['postApiV1ByOrganizationIdTerminalSessionsBySessionIdSuggestionsBySuggestionIdRespond']['responses']['200']['content']['application/json'];

export const respondToSuggestionHandler = http.post<
  MswPathParams,
  RequestBody,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions/{suggestionId}/respond',
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
