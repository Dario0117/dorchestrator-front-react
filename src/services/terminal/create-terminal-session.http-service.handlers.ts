import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type PathParams =
  operations['postApiV1ByOrganizationIdTerminalSessions']['parameters']['path'];
type SuccessResponse =
  operations['postApiV1ByOrganizationIdTerminalSessions']['responses']['201']['content']['application/json'];

export const createTerminalSessionHandler = http.post<
  PathParams,
  never,
  SuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/terminal/sessions'), () => {
  return HttpResponse.json(
    {
      responseData: {
        results: {
          id: 1,
          sessionToken: 'mock-session-token',
          deviceId: 1,
          status: 'active',
          shell: '/bin/bash',
          workingDirectory: '/home/user',
          createdAt: new Date().toISOString(),
        },
      },
      responseErrors: null,
    },
    { status: 201 },
  );
});
