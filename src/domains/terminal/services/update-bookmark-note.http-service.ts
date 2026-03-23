import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useUpdateBookmarkNoteMutation() {
  return $api.useMutation(
    'patch',
    '/api/v1/{organizationId}/terminal/bookmarks/{bookmarkId}',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['get', '/api/v1/{organizationId}/terminal/bookmarks'],
        });
      },
    },
  );
}
