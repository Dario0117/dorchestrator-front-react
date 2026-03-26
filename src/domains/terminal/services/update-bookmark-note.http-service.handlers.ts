import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type MswPathParams = {
  organizationId: string;
  bookmarkId: string;
};
type RequestBody =
  operations['patchApiV1ByOrganizationIdTerminalBookmarksByBookmarkId']['requestBody']['content']['application/json'];
type SuccessResponse =
  operations['patchApiV1ByOrganizationIdTerminalBookmarksByBookmarkId']['responses']['200']['content']['application/json'];

export const updateBookmarkNoteHandler = http.patch<
  MswPathParams,
  RequestBody,
  SuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/bookmarks/{bookmarkId}'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: [],
      },
      responseErrors: null,
    });
  },
);
