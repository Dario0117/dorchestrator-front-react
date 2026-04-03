import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useExtendTerminalSessionMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/extend',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            'get',
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
          ],
        });
      },
    },
  );
}
