import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useDeviceSandboxConfigQueryOptions = (
  organizationId: string,
  deviceId: number,
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/config',
    {
      params: {
        path: { organizationId, deviceId: String(deviceId) },
      },
    },
  );

export function useDeviceSandboxConfigSuspenseQuery(
  organizationId: string,
  deviceId: number,
) {
  return useSuspenseQuery(
    useDeviceSandboxConfigQueryOptions(organizationId, deviceId),
  );
}

export type useDeviceSandboxConfigQueryReturnType = ReturnType<
  typeof useDeviceSandboxConfigSuspenseQuery
>;
