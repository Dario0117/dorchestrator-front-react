import type { OrganizationItem } from '@services/organizations/list-user-organizations.http-service';
import type { QueryClient } from '@tanstack/react-query';

export interface RouterContext {
  queryClient: QueryClient;
  _getNullableCurrentOrganizationFromSlug: (
    slug: string,
  ) => OrganizationItem | undefined;
  getCurrentOrganizationFromSlug: (slug: string) => OrganizationItem;
}
