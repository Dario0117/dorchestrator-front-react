import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type MswPathParams = {
  organizationId: string;
  sessionId: string;
};
type SuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalSessionsBySessionIdSuggestions']['responses']['200']['content']['application/json'];

export const listSessionSuggestionsHandler = http.get<
  MswPathParams,
  never,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: [],
        hasNext: false,
        hasPrevious: false,
        totalResults: 0,
        totalPages: 0,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });
  },
);
