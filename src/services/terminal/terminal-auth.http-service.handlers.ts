import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type PathParams =
  operations['postApiV1ByOrganizationIdTerminalAuth']['parameters']['path'];
type SuccessResponse =
  operations['postApiV1ByOrganizationIdTerminalAuth']['responses']['201']['content']['application/json'];

export const terminalAuthHandler = http.post<
  PathParams,
  never,
  SuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/terminal/auth'), () => {
  return HttpResponse.json(
    {
      responseData: {
        results: {
          sessionToken: 'mock-terminal-auth-token',
        },
      },
      responseErrors: null,
    },
    { status: 201 },
  );
});
