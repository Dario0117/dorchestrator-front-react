import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export interface CommandsQueryParams {
  page?: number;
  size?: number;
  deviceId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const useCommandsQueryOptions = (
  organizationId: string,
  params: CommandsQueryParams = {},
) => {
  const {
    page = 1,
    size = 25,
    deviceId,
    status,
    startDate,
    endDate,
    search,
  } = params;

  return $api.queryOptions('get', '/api/v1/{organizationId}/commands', {
    params: {
      path: {
        organizationId: organizationId,
      },
      query: {
        page,
        size,
        deviceId,
        status: status as
          | 'pending'
          | 'running'
          | 'completed'
          | 'failed'
          | undefined,
        startDate,
        endDate,
        search,
      },
    },
  });
};

export function useCommandsSuspenseQuery(
  organizationId: string,
  params: CommandsQueryParams = {},
) {
  return useSuspenseQuery(useCommandsQueryOptions(organizationId, params));
}

export type useCommandsSuspenseQueryReturnType = ReturnType<
  typeof useCommandsSuspenseQuery
>;
export type useCommandsSuspenseQueryData =
  useCommandsSuspenseQueryReturnType['data'];
export type useCommandsSuspenseQueryResponseData = NonNullable<
  NonNullable<useCommandsSuspenseQueryData>['responseData']
>;
export type ListCommandsCommand =
  NonNullable<useCommandsSuspenseQueryResponseData>['results'][0];
