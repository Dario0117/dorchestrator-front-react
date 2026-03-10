import { queryClient } from '@context/query.provider';
import { $api } from '@/http-service-setup';

export function useUnshareTerminalSessionMutation() {
  return $api.useMutation(
    'delete',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/share',
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

export type useUnshareTerminalSessionMutationType = ReturnType<
  typeof useUnshareTerminalSessionMutation
>;
