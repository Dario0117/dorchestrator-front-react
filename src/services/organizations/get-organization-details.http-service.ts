import { DEFAULT_ORGANIZATION_ID } from '@stores/organization.store.constants';
import { $api } from '@/http-service-setup';

export function useOrganizationDetailsQuery(organizationId: string) {
  return $api.useQuery(
    'get',
    '/api/v1/{organizationId}/organization',
    {
      params: {
        path: { organizationId },
      },
    },
    {
      enabled: organizationId !== DEFAULT_ORGANIZATION_ID,
    },
  );
}

export type useOrganizationDetailsQueryReturnType = ReturnType<
  typeof useOrganizationDetailsQuery
>;
