import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useDevicesQueryOptions = (
  organizationId: string,
  teamId: string,
  page = 1,
  size = 10,
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/teams/{teamId}/devices',
    {
      params: {
        path: {
          organizationId,
          teamId,
        },
        query: {
          page,
          size,
        },
      },
    },
    {
      refetchInterval: 30000, // Poll every 30s for device metadata (online status is real-time via Centrifugo presence)
    },
  );

export function useDevicesSuspenseQuery(
  organizationId: string,
  teamId: string,
  page = 1,
  size = 10,
) {
  return useSuspenseQuery(
    useDevicesQueryOptions(organizationId, teamId, page, size),
  );
}

type useDevicesSuspenseQueryReturnType = ReturnType<
  typeof useDevicesSuspenseQuery
>;
type useDevicesSuspenseQueryData = useDevicesSuspenseQueryReturnType['data'];
type useDevicesSuspenseQueryResponseData = NonNullable<
  NonNullable<useDevicesSuspenseQueryData>['responseData']
>;
export type ListDevicesDevice =
  NonNullable<useDevicesSuspenseQueryResponseData>['results'][0];
