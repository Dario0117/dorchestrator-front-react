import type { QueryClient } from '@tanstack/react-query';
import type { OrganizationItem } from '@/stores/organization.store.types';

export interface RouterContext {
  queryClient: QueryClient;
  currentOrganization: OrganizationItem;
}
