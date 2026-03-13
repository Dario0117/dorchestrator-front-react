import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SuccessResponse =
  operations['deleteApiV1ByOrganizationIdTerminalBookmarksByBookmarkId']['responses']['200']['content']['application/json'];

// MSW path params are always strings, so we use a custom type for the handler
type DeleteBookmarkMswPathParams = {
  organizationId: string;
  bookmarkId: string;
};

export const deleteBookmarkHandler = http.delete<
  DeleteBookmarkMswPathParams,
  never,
  SuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/bookmarks/{bookmarkId}'),
  () => {
    return HttpResponse.json({
      responseData: { results: ['Bookmark deleted'] },
      responseErrors: null,
    });
  },
);
