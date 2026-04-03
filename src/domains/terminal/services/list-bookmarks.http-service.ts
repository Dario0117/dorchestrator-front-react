import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type ListBookmarksOperation =
  operations['getApiV1ByOrganizationIdTerminalBookmarks'];

type ListBookmarksResponse =
  ListBookmarksOperation['responses']['200']['content']['application/json'];

type BookmarkItem = ListBookmarksResponse['responseData']['results'][0];

export type { BookmarkItem };

type BookmarkQueryParams = Partial<
  ListBookmarksOperation['parameters']['query']
>;

export const useBookmarksQueryOptions = (
  organizationId: string,
  params: BookmarkQueryParams = {},
) => {
  const { page = 1, size = 25 } = params;

  return $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/bookmarks',
    {
      params: {
        path: { organizationId },
        query: { page, size },
      },
    },
  );
};

export function useBookmarksSuspenseQuery(
  organizationId: string,
  params: BookmarkQueryParams = {},
) {
  return useSuspenseQuery(useBookmarksQueryOptions(organizationId, params));
}
