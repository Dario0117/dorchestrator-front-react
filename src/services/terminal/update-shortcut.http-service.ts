import { queryClient } from '@context/query.provider';
import { $api } from '@/http-service-setup';

export function useUpdateShortcutMutation() {
  return $api.useMutation(
    'patch',
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
