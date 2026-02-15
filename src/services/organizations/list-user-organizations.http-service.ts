import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useUserOrganizationsQueryOptions = $api.queryOptions(
  'get',
  '/api/v1/organizations',
  {
    params: {
      query: {
        page: 1,
        size: 100,
      },
    },
  },
  {
    staleTime: 60000, // Cache for 1 minute
  },
);

export function useUserOrganizationsSuspendedQuery() {
  return useSuspenseQuery(useUserOrganizationsQueryOptions);
}

export type useUserOrganizationsQueryReturnType = ReturnType<
  typeof useUserOrganizationsSuspendedQuery
>;

export type OrganizationItem = NonNullable<
  useUserOrganizationsQueryReturnType['data']['responseData']
>['results'][0];
