import { $api } from '@/http-service-setup';

export function useOrganizationStatsQuery(organizationId: string) {
  return $api.useQuery(
    'get',
    '/api/v1/{organizationId}/organization/stats',
    {
      params: {
        path: { organizationId },
      },
    },
    {
      enabled: !!organizationId,
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  );
}

export type useOrganizationStatsQueryReturnType = ReturnType<
  typeof useOrganizationStatsQuery
>;
