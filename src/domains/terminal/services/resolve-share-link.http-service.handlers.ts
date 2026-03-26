import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type PathParams =
  operations['getApiV1ByOrganizationIdTerminalSharedByShareToken']['parameters']['path'];
type SuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalSharedByShareToken']['responses']['200']['content']['application/json'];

export const resolveShareLinkHandler = http.get<
  PathParams,
  never,
  SuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/shared/{shareToken}'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          sessionId: 100,
          organizationId: 'org-1',
          deviceId: 1,
          userId: 'user-1',
          status: 'active',
          shell: '/bin/bash',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
      responseErrors: null,
    });
  },
);
