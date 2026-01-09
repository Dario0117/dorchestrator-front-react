import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';

export const getOrganizationStatsHandler = http.get(
  buildBackendUrl('/api/v1/:organizationId/organization/stats'),
  () => {
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
              createdAt: '2025-12-21T10:00:00.000Z',
            },
            {
              id: 2,
              command: 'ls -la',
              status: 'completed',
              createdAt: '2025-12-21T09:30:00.000Z',
            },
            {
              id: 3,
              command: 'pwd',
              status: 'pending',
              createdAt: '2025-12-21T09:00:00.000Z',
            },
          ],
        },
      },
      responseErrors: null,
    });
  },
);
