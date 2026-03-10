import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type SessionHistoryOperation =
  operations['getApiV1ByOrganizationIdTerminalSessionsHistory'];

type SessionHistoryResponse =
  SessionHistoryOperation['responses']['200']['content']['application/json'];

type SessionHistoryResultItem =
  SessionHistoryResponse['responseData']['results'][0];

export type SessionHistoryItem = SessionHistoryResultItem;

export type SessionHistoryQueryParams = Partial<
  SessionHistoryOperation['parameters']['query']
>;

export const useSessionHistoryQueryOptions = (
  organizationId: string,
  params: SessionHistoryQueryParams = {},
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
    '/api/v1/{organizationId}/terminal/sessions/history',
    {
      params: {
        path: { organizationId },
        query: { page, size, status, deviceId, userId, dateFrom, dateTo },
      },
    },
    {
      refetchInterval: 30_000,
    },
  );
};

export function useSessionHistorySuspenseQuery(
  organizationId: string,
  params: SessionHistoryQueryParams = {},
) {
  return useSuspenseQuery(
    useSessionHistoryQueryOptions(organizationId, params),
  );
}

export function useSessionHistoryQuery(
  organizationId: string,
  params: SessionHistoryQueryParams = {},
) {
  return useQuery(useSessionHistoryQueryOptions(organizationId, params));
}

export type useSessionHistorySuspenseQueryReturnType = ReturnType<
  typeof useSessionHistorySuspenseQuery
>;
export type useSessionHistorySuspenseQueryData =
  useSessionHistorySuspenseQueryReturnType['data'];
