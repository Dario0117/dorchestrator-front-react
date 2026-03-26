import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type MswPathParams = {
  organizationId: string;
  sessionId: string;
};
type RequestBody =
  operations['postApiV1ByOrganizationIdTerminalSessionsBySessionIdSuggestions']['requestBody']['content']['application/json'];
type SuccessResponse =
  operations['postApiV1ByOrganizationIdTerminalSessionsBySessionIdSuggestions']['responses']['201']['content']['application/json'];

export const submitSuggestionHandler = http.post<
  MswPathParams,
  RequestBody,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions',
  ),
  async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        responseData: {
          results: {
            id: 1,
            suggestionText: body.suggestionText,
            response: 'pending',
            suggesterUserId: 'user-1',
            suggesterName: 'Test User',
            responderUserId: null,
            responderName: null,
            suggestedAt: new Date().toISOString(),
            respondedAt: null,
          },
        },
        responseErrors: null,
      },
      { status: 201 },
    );
  },
);
