import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useDeleteBookmarkMutation() {
  return $api.useMutation(
    'delete',
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
