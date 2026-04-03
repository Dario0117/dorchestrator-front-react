import {
  PENDING_REFETCH_INTERVAL_MS,
  RUNNING_REFETCH_INTERVAL_MS,
} from '@domains/commands/services/get-command.http-service.constants';
import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useGetCommandQueryOptions = (
  organizationId: string,
  teamId: string,
  commandId: number,
) => ({
  ...$api.queryOptions(
    'get',
    '/api/v1/{organizationId}/teams/{teamId}/commands/{commandId}',
    {
      params: {
        path: {
          organizationId: organizationId,
          teamId: teamId,
          commandId: commandId,
        },
      },
    },
  ),
  refetchInterval: (query: {
    state: { data?: { responseData?: { results?: { status?: string } } } };
  }) => {
    const status = query.state.data?.responseData?.results?.status;
    if (status === 'pending') {
      return PENDING_REFETCH_INTERVAL_MS;
    }
    if (status === 'running') {
      return RUNNING_REFETCH_INTERVAL_MS;
    }
    return false as const;
  },
});

export function useGetCommandSuspenseQuery(
  organizationId: string,
  teamId: string,
  commandId: number,
) {
  return useSuspenseQuery(
    useGetCommandQueryOptions(organizationId, teamId, commandId),
  );
}

type useGetCommandSuspenseQueryReturnType = ReturnType<
  typeof useGetCommandSuspenseQuery
>;
type useGetCommandSuspenseQueryData =
  useGetCommandSuspenseQueryReturnType['data'];
export type useGetCommandSuspenseQueryResponseData = NonNullable<
  NonNullable<useGetCommandSuspenseQueryData>['responseData']
>;
export type GetCommandDetail =
  NonNullable<useGetCommandSuspenseQueryResponseData>['results'];
