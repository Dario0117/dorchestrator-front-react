import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetTerminalSessionSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalSessionsBySessionId']['responses']['200']['content']['application/json'];

export const getTerminalSessionHandler = http.get<
  { organizationId: string; sessionId: string },
  never,
  GetTerminalSessionSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/sessions/{sessionId}'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          id: 1,
          deviceId: 1,
          deviceName: 'Production Server',
          userId: 'user-1',
          userName: 'Alice',
          status: 'active',
          shell: '/bin/bash',
          workingDirectory: '/home/user',
          sessionToken: 'mock-session-token',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          lastActivityAt: new Date(Date.now() - 60000).toISOString(),
          inactivityTimeoutMs: 300000,
          terminatedAt: null,
          isShared: false,
        },
      },
      responseErrors: null,
    });
  },
);
