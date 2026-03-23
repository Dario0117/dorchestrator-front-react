import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useUpdateDeviceConfigMutation() {
  return $api.useMutation(
    'put',
    '/api/v1/{organizationId}/terminal/config/{deviceId}',
    {
      onSuccess: (_data, { params }) => {
        const organizationId = params?.path?.organizationId ?? '';
        const deviceId = params?.path?.deviceId ?? 0;
        const { queryKey } = $api.queryOptions(
          'get',
          '/api/v1/{organizationId}/terminal/config/{deviceId}',
          { params: { path: { organizationId, deviceId } } },
        );
        queryClient.invalidateQueries({ queryKey });
      },
    },
  );
}

export type useUpdateDeviceConfigMutationType = ReturnType<
  typeof useUpdateDeviceConfigMutation
>;
