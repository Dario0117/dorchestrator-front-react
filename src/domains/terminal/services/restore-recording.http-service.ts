import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useRestoreRecordingMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/recording/restore',
    {
      onSuccess: (_data, { params }) => {
        queryClient.invalidateQueries({
          queryKey: [
            'get',
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}/recording',
            { params: { path: params.path } },
          ],
        });
      },
    },
  );
}

export type useRestoreRecordingMutationType = ReturnType<
  typeof useRestoreRecordingMutation
>;
