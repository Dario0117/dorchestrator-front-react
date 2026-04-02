import { useDevicePluginsQueryOptions } from '@domains/sandbox/services/get-device-plugins.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useInstallDevicePluginMutation(
  organizationId: string,
  deviceId: string,
) {
  const { queryKey } = useDevicePluginsQueryOptions(organizationId, deviceId, {
    page: 1,
    size: 50,
  });

  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/plugins',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    },
  );
}

export type useInstallDevicePluginMutationType = ReturnType<
  typeof useInstallDevicePluginMutation
>;
