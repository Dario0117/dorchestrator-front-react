import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type TerminalSessionsQuery =
  operations['getApiV1ByOrganizationIdTerminalSessions']['parameters']['query'];

export interface TerminalSessionsQueryParams {
  page?: number;
  size?: number;
  status?: TerminalSessionsQuery['status'];
  deviceId?: TerminalSessionsQuery['deviceId'];
  userId?: TerminalSessionsQuery['userId'];
  dateFrom?: TerminalSessionsQuery['dateFrom'];
  dateTo?: TerminalSessionsQuery['dateTo'];
}

export const useTerminalSessionsQueryOptions = (
  organizationId: string,
  params: TerminalSessionsQueryParams = {},
) => {
  const {
    page = 1,
    size = 25,
    status,
    deviceId,
    userId,
    dateFrom,
    dateTo,
  } = params;

  return $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/sessions',
    {
      params: {
        path: {
          organizationId,
        },
        query: {
          page,
          size,
          status,
          deviceId,
          userId,
          dateFrom,
          dateTo,
        },
      },
    },
    {
      refetchInterval: 30_000,
    },
  );
};

export function useTerminalSessionsSuspenseQuery(
  organizationId: string,
  params: TerminalSessionsQueryParams = {},
) {
  return useSuspenseQuery(
    useTerminalSessionsQueryOptions(organizationId, params),
  );
}

export type useTerminalSessionsSuspenseQueryReturnType = ReturnType<
  typeof useTerminalSessionsSuspenseQuery
>;
export type useTerminalSessionsSuspenseQueryData =
  useTerminalSessionsSuspenseQueryReturnType['data'];
export type useTerminalSessionsSuspenseQueryResponseData = NonNullable<
  NonNullable<useTerminalSessionsSuspenseQueryData>['responseData']
>;
export type TerminalSessionListItem =
  NonNullable<useTerminalSessionsSuspenseQueryResponseData>['results'][0];
