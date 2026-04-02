import { $api } from '@/http-service-setup';

export function useKillDeviceSessionsMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/kill-sessions',
  );
}

export type useKillDeviceSessionsMutationType = ReturnType<
  typeof useKillDeviceSessionsMutation
>;
