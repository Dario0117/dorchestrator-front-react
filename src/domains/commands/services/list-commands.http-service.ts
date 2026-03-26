import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type CommandsQuery =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdCommands']['parameters']['query'];

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
  teamId: string,
  params: CommandsQueryParams = {},
) => {
  const {
    page = 1,
    size = 10,
    deviceId,
    status,
    startDate,
    endDate,
    search,
  } = params;

  return $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/teams/{teamId}/commands',
    {
      params: {
        path: {
          organizationId,
          teamId,
        },
        query: {
          page,
          size,
          deviceId,
          status,
          startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined,
          endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined,
          search,
        },
      },
    },
  );
};

export function useCommandsSuspenseQuery(
  organizationId: string,
  teamId: string,
  params: CommandsQueryParams = {},
) {
  return useSuspenseQuery(
    useCommandsQueryOptions(organizationId, teamId, params),
  );
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
