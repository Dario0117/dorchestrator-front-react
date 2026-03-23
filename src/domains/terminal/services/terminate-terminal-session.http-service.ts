import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useTerminateTerminalSessionMutation() {
  return $api.useMutation(
    'delete',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['get', '/api/v1/{organizationId}/terminal/sessions'],
        });
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

export type useTerminateTerminalSessionMutationType = ReturnType<
  typeof useTerminateTerminalSessionMutation
>;
