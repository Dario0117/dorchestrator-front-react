import { queryClient } from '@context/query.provider';
import { $api } from '@/http-service-setup';

export function useUnlockTerminalSessionMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/unlock',
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

export type useUnlockTerminalSessionMutationType = ReturnType<
  typeof useUnlockTerminalSessionMutation
>;
