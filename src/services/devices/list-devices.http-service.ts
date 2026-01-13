import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useDevicesQueryOptions = (
  organizationId: string,
  page = 1,
  size = 10,
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/devices',
    {
      params: {
        path: {
          organizationId: organizationId,
        },
        query: {
          page: page,
          size: size,
        },
      },
    },
    {
      refetchInterval: 10000, // Poll every 10s for status updates
    },
  );

export function useDevicesSuspenseQuery(
  organizationId: string,
  page = 1,
  size = 10,
) {
  return useSuspenseQuery(useDevicesQueryOptions(organizationId, page, size));
}

export type useDevicesSuspenseQueryReturnType = ReturnType<
  typeof useDevicesSuspenseQuery
>;
export type useDevicesSuspenseQueryData =
  useDevicesSuspenseQueryReturnType['data'];
export type useDevicesSuspenseQueryResponseData = NonNullable<
  NonNullable<useDevicesSuspenseQueryData>['responseData']
>;
export type useDevicesSuspenseQueryResponseErrors = NonNullable<
  NonNullable<useDevicesSuspenseQueryData>['responseErrors']
>;
export type ListDevicesDevice =
  NonNullable<useDevicesSuspenseQueryResponseData>['results'][0];
