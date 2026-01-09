import { queryClient } from '@/context/query.provider';
import { $api } from '@/http-service-setup';

export function useRemoveDeviceMutation() {
  return $api.useMutation(
    'delete',
    '/api/v1/{organizationId}/devices/{deviceId}',
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['devices', variables.params.path.organizationId],
        });
      },
    },
  );
}

export type useRemoveDeviceMutationType = ReturnType<
  typeof useRemoveDeviceMutation
>;
