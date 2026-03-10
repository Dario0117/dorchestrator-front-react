import { queryClient } from '@context/query.provider';
import { $api } from '@/http-service-setup';

export function useShareTerminalSessionMutation() {
  return $api.useMutation(
    'post',
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

export type useShareTerminalSessionMutationType = ReturnType<
  typeof useShareTerminalSessionMutation
>;
