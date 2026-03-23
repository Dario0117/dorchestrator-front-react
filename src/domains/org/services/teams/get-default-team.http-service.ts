import { useQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useDefaultTeamQueryOptions = (organizationId: string) =>
  $api.queryOptions(
    'get',
    '/api/v1/organizations/default-team',
    {
      params: {
        query: { organizationId },
      },
    },
    {
      staleTime: 60_000,
    },
  );

export function useDefaultTeamQuery(organizationId: string) {
  return useQuery(useDefaultTeamQueryOptions(organizationId));
}
