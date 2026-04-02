import { $api } from '@/http-service-setup';

export function useRefreshDevicePluginsMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/plugins/refresh',
  );
}

export type useRefreshDevicePluginsMutationType = ReturnType<
  typeof useRefreshDevicePluginsMutation
>;
