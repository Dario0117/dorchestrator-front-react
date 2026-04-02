import { $api } from '@/http-service-setup';

export function useSetDeviceDefaultPresetMutation() {
  return $api.useMutation(
    'put',
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/default-preset',
  );
}

export type useSetDeviceDefaultPresetMutationType = ReturnType<
  typeof useSetDeviceDefaultPresetMutation
>;
