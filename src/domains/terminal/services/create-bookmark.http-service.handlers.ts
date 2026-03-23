import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type PathParams =
  operations['postApiV1ByOrganizationIdTerminalBookmarks']['parameters']['path'];
type RequestBody =
  operations['postApiV1ByOrganizationIdTerminalBookmarks']['requestBody']['content']['application/json'];
type SuccessResponse =
  operations['postApiV1ByOrganizationIdTerminalBookmarks']['responses']['201']['content']['application/json'];

export const createBookmarkHandler = http.post<
  PathParams,
  RequestBody,
  SuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/bookmarks'),
  async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        responseData: {
          results: {
            id: 99,
            userId: 'user-1',
            sessionId: body.sessionId,
            organizationId: 'org-1',
            note: body.note ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        responseErrors: null,
      },
      { status: 201 },
    );
  },
);
