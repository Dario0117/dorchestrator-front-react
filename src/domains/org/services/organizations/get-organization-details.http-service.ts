import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useOrganizationDetailsQueryOptions = (organizationId: string) =>
  $api.queryOptions('get', '/api/v1/{organizationId}/organization', {
    params: {
      path: { organizationId: organizationId },
    },
  });

export function useOrganizationDetailsSuspenseQuery(organizationId: string) {
  return useSuspenseQuery(useOrganizationDetailsQueryOptions(organizationId));
}
