import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useGetDeviceConfigQueryOptions = (
  organizationId: string,
  deviceId: number,
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/config/{deviceId}',
    {
      params: {
        path: {
          organizationId,
          deviceId,
        },
      },
    },
  );

export function useGetDeviceConfigSuspenseQuery(
  organizationId: string,
  deviceId: number,
) {
  return useSuspenseQuery(
    useGetDeviceConfigQueryOptions(organizationId, deviceId),
  );
}

export type useGetDeviceConfigSuspenseQueryReturnType = ReturnType<
  typeof useGetDeviceConfigSuspenseQuery
>;
export type useGetDeviceConfigSuspenseQueryData =
  useGetDeviceConfigSuspenseQueryReturnType['data'];
