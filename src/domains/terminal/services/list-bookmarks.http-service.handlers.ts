import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type PathParams =
  operations['getApiV1ByOrganizationIdTerminalBookmarks']['parameters']['path'];
type SuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalBookmarks']['responses']['200']['content']['application/json'];

export const listBookmarksHandler = http.get<
  PathParams,
  never,
  SuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/terminal/bookmarks'), () => {
  return HttpResponse.json({
    responseData: {
      results: [
        {
          id: 1,
          sessionId: 100,
          note: 'Test bookmark',
          createdAt: '2024-01-01T00:00:00.000Z',
          sessionStatus: 'terminated',
          sessionCreatedAt: '2024-01-01T00:00:00.000Z',
          sessionTerminatedAt: '2024-01-01T01:00:00.000Z',
          recordingSizeBytes: 1024,
          deviceName: 'test-device',
        },
      ],
      hasNext: false,
      hasPrevious: false,
      totalResults: 1,
      totalPages: 1,
      page: 1,
      size: 25,
    },
    responseErrors: null,
  });
});
