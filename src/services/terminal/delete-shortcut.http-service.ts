import { queryClient } from '@context/query.provider';
import { $api } from '@/http-service-setup';

export function useDeleteShortcutMutation() {
  return $api.useMutation(
    'delete',
    '/api/v1/{organizationId}/terminal/shortcuts/{shortcutId}',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['get', '/api/v1/{organizationId}/terminal/shortcuts'],
        });
      },
    },
  );
}
