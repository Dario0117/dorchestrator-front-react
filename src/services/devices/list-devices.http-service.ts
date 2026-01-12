import { useQuery } from '@tanstack/react-query';
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

export function useDevicesQuery(organizationId: string, page = 1, size = 10) {
  return useQuery(useDevicesQueryOptions(organizationId, page, size));
}

export type useDevicesQueryReturnType = ReturnType<typeof useDevicesQuery>;
export type useDevicesQueryData = useDevicesQueryReturnType['data'];
export type useDevicesQueryResponseData = NonNullable<
  NonNullable<useDevicesQueryData>['responseData']
>;
export type useDevicesQueryResponseErrors = NonNullable<
  NonNullable<useDevicesQueryData>['responseErrors']
>;
export type ListDevicesDevice =
  NonNullable<useDevicesQueryResponseData>['results'][0];
