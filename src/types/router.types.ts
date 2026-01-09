import type { OrganizationItem } from '@stores/organization.store.types';
import type { QueryClient } from '@tanstack/react-query';

export interface RouterContext {
  queryClient: QueryClient;
  currentOrganization: OrganizationItem;
}
