import { queryClient } from '@context/query.provider';
import { $api } from '@/http-service-setup';

export function useCreateShortcutMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/shortcuts',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['get', '/api/v1/{organizationId}/terminal/shortcuts'],
        });
      },
    },
  );
}
