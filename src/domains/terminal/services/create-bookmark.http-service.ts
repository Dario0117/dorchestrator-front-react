import { $api } from '@/http-service-setup';

export function useCreateBookmarkMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/bookmarks',
  );
}
