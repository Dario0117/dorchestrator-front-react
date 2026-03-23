import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetOrganizationStatsPathParams =
  operations['getApiV1ByOrganizationIdOrganizationStats']['parameters']['path'];
type GetOrganizationStatsSuccessResponse =
  operations['getApiV1ByOrganizationIdOrganizationStats']['responses']['200']['content']['application/json'];

export const getOrganizationStatsHandler = http.get<
  GetOrganizationStatsPathParams,
  never,
  GetOrganizationStatsSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/organization/stats'), () => {
  return HttpResponse.json({
    responseData: {
      results: {
        deviceCount: 3,
        recentCommandCount: 5,
        recentCommands: [
          {
            id: 1,
            command: 'echo "test"',
            status: 'completed',
            deviceName: 'server-1',
            createdAt: '2025-12-21T10:00:00.000Z',
          },
          {
            id: 2,
            command: 'ls -la',
            status: 'completed',
            deviceName: 'server-2',
            createdAt: '2025-12-21T09:30:00.000Z',
          },
          {
            id: 3,
            command: 'pwd',
            status: 'pending',
            deviceName: 'server-1',
            createdAt: '2025-12-21T09:00:00.000Z',
          },
        ],
      },
    },
    responseErrors: null,
  });
});
