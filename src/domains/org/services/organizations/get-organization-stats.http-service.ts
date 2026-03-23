import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useOrganizationStatsQueryOptions = (organizationId: string) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/organization/stats',
    {
      params: {
        path: { organizationId: organizationId },
      },
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  );

export function useOrganizationStatsSuspenseQuery(organizationId: string) {
  return useSuspenseQuery(useOrganizationStatsQueryOptions(organizationId));
}

export type useOrganizationStatsQueryReturnType = ReturnType<
  typeof useOrganizationStatsSuspenseQuery
>;
