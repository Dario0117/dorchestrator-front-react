import type { OrganizationItem } from '@stores/organization.store.types';
import type { QueryClient } from '@tanstack/react-query';

export interface RouterContext {
  queryClient: QueryClient;
  _getNullableCurrentOrganizationFromSlug: (
    slug: string,
  ) => OrganizationItem | undefined;
  getCurrentOrganizationFromSlug: (slug: string) => OrganizationItem;
}
