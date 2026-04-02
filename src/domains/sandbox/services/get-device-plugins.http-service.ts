import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useDevicePluginsQueryOptions = (
  organizationId: string,
  deviceId: string,
  params: { page: number; size: number },
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/plugins',
    {
      params: {
        query: { page: params.page, size: params.size },
        path: { organizationId, deviceId },
      },
    },
  );

export function useDevicePluginsSuspenseQuery(
  organizationId: string,
  deviceId: string,
  params: { page: number; size: number },
) {
  return useSuspenseQuery(
    useDevicePluginsQueryOptions(organizationId, deviceId, params),
  );
}

export type useDevicePluginsQueryReturnType = ReturnType<
  typeof useDevicePluginsSuspenseQuery
>;
