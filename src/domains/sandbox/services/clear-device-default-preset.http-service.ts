import { $api } from '@/http-service-setup';

export function useClearDeviceDefaultPresetMutation() {
  return $api.useMutation(
    'delete',
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/default-preset',
  );
}

export type useClearDeviceDefaultPresetMutationType = ReturnType<
  typeof useClearDeviceDefaultPresetMutation
>;
