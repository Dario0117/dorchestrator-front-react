import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type CommandsQuery =
  operations['getApiV1ByOrganizationIdCommands']['parameters']['query'];

export interface CommandsQueryParams {
  page?: number;
  size?: number;
  deviceId?: number;
  status?: CommandsQuery['status'];
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
    size = 26,
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
        status,
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
